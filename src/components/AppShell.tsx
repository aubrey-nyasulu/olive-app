import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  type KeyboardEvent,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive, type FeedMode } from "../context/OliveProvider";
import { getProfile } from "../profiles";
import { GuidanceModal } from "./GuidanceModal";
import { TypeSearch, VisualSearch } from "./SearchModes";

const SEARCH_OPTIONS = [
  { icon: "mic" as const, label: "Voice", mode: "voice" as const },
  { icon: "keypad" as const, label: "Type", mode: "type" as const },
  { icon: "camera" as const, label: "Visual", mode: "visual" as const },
];

const FEED_MODE_OPTIONS = [
  {
    icon: "layers" as const,
    label: "All Activity",
    desc: "Both people & places",
    mode: "all" as const,
  },
  {
    icon: "people" as const,
    label: "People Only",
    desc: "Guides & locals nearby",
    mode: "people" as const,
  },
  {
    icon: "business" as const,
    label: "Places & Events",
    desc: "Businesses & venue drops",
    mode: "places" as const,
  },
];

const PROFILE_OPTIONS = [
  { icon: "settings" as const, label: "Settings", id: "settings" as const },
  { icon: "bookmark" as const, label: "Saved", id: "saved" as const },
  { icon: "share-social" as const, label: "Share", id: "share" as const },
];

const OTHER_USER_OPTIONS = [
  {
    icon: "chatbubble-ellipses" as const,
    label: "Message",
    id: "message" as const,
  },
  { icon: "notifications" as const, label: "Alerts", id: "alerts" as const },
  { icon: "share-social" as const, label: "Share", id: "share_user" as const },
  { icon: "link" as const, label: "Copy Link", id: "copy" as const },
  { icon: "flag" as const, label: "Report", id: "report" as const },
];

// Acoustic LFO frequencies & strand layout for sound intake shapeshifting
const LFO_DURATIONS = [420, 560, 360, 720, 480, 640, 390, 800];
const NUM_STRANDS = 25;
const STRANDS_CONFIG = Array.from({ length: NUM_STRANDS }, (_, i) => {
  const dist = Math.abs(i - 12);
  const normDist = dist / 12;
  // Cosine window envelope - 0 at edges (anchored to baseline), 1 at center
  const weight = Math.cos(normDist * (Math.PI / 2)) ** 1.6;
  const lfoIndex = (i * 3) % LFO_DURATIONS.length;
  return { dist, weight, lfoIndex };
});

export function AppShell({ children }: { children: ReactNode }) {
  const {
    colors,
    feedMode,
    setFeedMode,
    searchOpen,
    setSearchOpen,
    activeMode,
    setActiveMode,
    isListening,
    setIsListening,
    typeQuery,
    setTypeQuery,
    closeSearch,
    isSearching,
    setIsSearching,
    profileTab,
    setProfileTab,
    profileModal,
    setProfileModal,
    isScanning,
    setIsScanning,
  } = useOlive();

  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const [rootHeight, setRootHeight] = useState(Dimensions.get("window").height);
  const initialRootHeightRef = useRef(Dimensions.get("window").height);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard avoidance animation offset
  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;
  const normalDockBottom = Math.max(20, insets.bottom + 8);
  const normalPanelBottom = normalDockBottom + 72;

  const pathname = usePathname();
  const { author, id } = useLocalSearchParams<{
    author?: string;
    id?: string;
  }>();
  const currentProfile = getProfile(author || id);
  const onFeed = pathname === "/";
  const onProfile = pathname === "/profile";
  const isOtherUser =
    onProfile &&
    currentProfile.id !== "chisomo" &&
    currentProfile.id !== "amara";
  const showDock = onFeed || onProfile;
  const panelOpen = activeMode !== null;
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [leftModeMenuOpen, setLeftModeMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 2.6s initial loading timer upon opening app (shows animating line while initial content loads)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  // Animating line is ONLY visible during initial load OR when actively searching
  const showAnimatingLine = isInitialLoading || isSearching;

  // States for other user interactions (Message, Report, Alerts, Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [alertsMap, setAlertsMap] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const isVoice = activeMode === "voice";

  // Track layout width for the sweeping line
  const [trackWidth, setTrackWidth] = useState(140);
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const dotPulseAnim = useRef(new Animated.Value(1)).current;

  // Seamless Morph Animations between Scanning Line & Voice Intake
  const voiceOpacityAnim = useRef(new Animated.Value(0)).current;
  const voiceScaleYAnim = useRef(new Animated.Value(0)).current;
  const sweepOpacityAnim = useRef(new Animated.Value(1)).current;

  // LFOs for acoustic voice/sound intake resonance
  const lfoValues = useRef(
    LFO_DURATIONS.map(() => new Animated.Value(0))
  ).current;

  // 1. Line Sweep Animation - only sweeps when showAnimatingLine is true (app opened or searching)
  useEffect(() => {
    if (!showAnimatingLine) {
      sweepAnim.stopAnimation();
      Animated.timing(sweepOpacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      return;
    }
    sweepAnim.setValue(0);
    Animated.timing(sweepOpacityAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    const sweepLoop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    sweepLoop.start();
    return () => sweepLoop.stop();
  }, [sweepAnim, sweepOpacityAnim, showAnimatingLine]);

  // 2. Signal Dot Pulse Animation (2s ease-in-out infinite)
  useEffect(() => {
    if (!isScanning) {
      dotPulseAnim.stopAnimation();
      return;
    }
    dotPulseAnim.setValue(1);
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulseAnim, {
          toValue: 0.35,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dotPulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [dotPulseAnim, isScanning]);

  // 3. Acoustic LFO Oscillators for Sound Intake
  useEffect(() => {
    const loops = lfoValues.map((val, idx) => {
      const dur = LFO_DURATIONS[idx];
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    });

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [lfoValues]);

  // 4. Shapeshift between Scanning Line & Voice Intake Wave
  useEffect(() => {
    if (isVoice) {
      Animated.parallel([
        Animated.timing(sweepOpacityAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(voiceOpacityAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(voiceScaleYAnim, {
          toValue: isListening ? 1 : 0.28,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(voiceOpacityAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(voiceScaleYAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweepOpacityAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    isVoice,
    isListening,
    sweepOpacityAnim,
    voiceOpacityAnim,
    voiceScaleYAnim,
  ]);

  // Pre-calculate strand scale interpolations based on LFOs and acoustic envelope
  const strandInterpolations = useMemo(() => {
    return STRANDS_CONFIG.map(({ weight, lfoIndex }) => {
      const lfo = lfoValues[lfoIndex];
      const minScale = Math.max(0.08, 0.12 * weight);
      const maxScale = Math.max(0.1, 0.15 + 0.85 * weight);
      return lfo.interpolate({
        inputRange: [0, 1],
        outputRange: [minScale, maxScale],
      });
    });
  }, [lfoValues]);

  const barWidth = Math.max(30, trackWidth * 0.35);
  const sweepTranslateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-barWidth, trackWidth],
  });

  // Listen for screen dimensions
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setScreenHeight(window.height);
    });
    return () => sub.remove();
  }, []);

  // Keyboard avoidance animation: floats dock and search panel right above the keyboard
  useEffect(() => {
    const handleShow = (e: KeyboardEvent) => {
      const kh = e.endCoordinates.height;
      if (!kh || kh <= 0) return;
      setKeyboardHeight(kh);

      // Check if root view shrank due to OS auto resize (e.g. Android adjustResize)
      const windowDidResize =
        initialRootHeightRef.current > 0 &&
        initialRootHeightRef.current - rootHeight >= kh * 0.6;

      // If the window did not resize, shift dock so it sits exactly 12px above keyboard
      const shift = windowDidResize
        ? 0
        : Math.max(0, kh + 32 - normalDockBottom);

      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: shift,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    const handleHide = (e: KeyboardEvent) => {
      setKeyboardHeight(0);
      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    const showEvents: ("keyboardWillShow" | "keyboardDidShow")[] =
      Platform.OS === "ios"
        ? ["keyboardWillShow"]
        : ["keyboardWillShow", "keyboardDidShow"];

    const hideEvents: ("keyboardWillHide" | "keyboardDidHide")[] =
      Platform.OS === "ios"
        ? ["keyboardWillHide"]
        : ["keyboardWillHide", "keyboardDidHide"];

    const subs = [
      ...showEvents.map((ev) => Keyboard.addListener(ev, handleShow)),
      ...hideEvents.map((ev) => Keyboard.addListener(ev, handleHide)),
    ];

    return () => {
      subs.forEach((s) => s.remove());
    };
  }, [keyboardShiftAnim, normalDockBottom, rootHeight]);

  const maxPanelHeight = Math.max(
    160,
    screenHeight -
      (keyboardHeight > 0 ? keyboardHeight + 110 : normalDockBottom + 100) -
      insets.top -
      50
  );

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setProfileMenuOpen(false);
    setLeftModeMenuOpen(false);
    closeSearch();
  };

  const handleSearchAction = () => {
    if (onProfile) {
      setProfileMenuOpen((prev) => !prev);
      return;
    }
    if (panelOpen) {
      if (activeMode === "voice") {
        setIsListening((l) => !l);
      } else if (activeMode === "type") {
        Keyboard.dismiss();
        setIsSearching(true);
        setTimeout(() => {
          setIsSearching(false);
        }, 1800);
      } else {
        handleCloseSearch();
      }
    } else {
      setSearchOpen((prev) => !prev);
    }
  };

  const handleLeftPill = () => {
    Keyboard.dismiss();
    if (leftModeMenuOpen) {
      setLeftModeMenuOpen(false);
      return;
    }
    if (profileMenuOpen) {
      setProfileMenuOpen(false);
      return;
    }
    if (panelOpen || searchOpen) {
      closeSearch();
    } else if (onProfile) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate("/");
      }
    } else if (onFeed) {
      // Single click/press: cycles feed modes all -> people -> places -> all
      const nextMode: FeedMode =
        feedMode === "all"
          ? "people"
          : feedMode === "people"
          ? "places"
          : "all";
      setFeedMode(nextMode);
      if (nextMode === "people") {
        showToast("👥 Feed: People only (Lilongwe)");
      } else if (nextMode === "places") {
        showToast("🏢 Feed: Places, businesses & events");
      } else {
        showToast("🌐 Feed: All community activity");
      }
    } else if (!onFeed) {
      router.navigate("/");
    }
  };

  const handleLeftLongPress = () => {
    if (onFeed && !panelOpen && !searchOpen) {
      setLeftModeMenuOpen((prev) => !prev);
    }
  };

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0) {
          if (
            !initialRootHeightRef.current ||
            h > initialRootHeightRef.current
          ) {
            initialRootHeightRef.current = h;
          }
          setRootHeight(h);
        }
      }}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <View style={styles.contentWrap}>{children}</View>

      {/* Dimmed backdrop when search is open, profile menu is open, or left mode menu is open */}
      {(searchOpen || panelOpen || profileMenuOpen || leftModeMenuOpen) && (
        <Pressable
          accessibilityLabel="Dismiss options"
          onPress={handleCloseSearch}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        />
      )}

      {/* Mode Search Content Panel */}
      {panelOpen && activeMode !== "voice" && (
        <Animated.View
          style={[
            styles.panelContainer,
            {
              bottom: normalPanelBottom,
              maxHeight: maxPanelHeight,
              transform: [
                { translateY: Animated.multiply(keyboardShiftAnim, -1) },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.panelCard,
              { backgroundColor: colors.bg, borderColor: colors.line },
            ]}
          >
            {activeMode === "type" && (
              <TypeSearch
                query={typeQuery}
                onSelectCategory={(cat) => {
                  setTypeQuery(cat);
                  setIsSearching(true);
                  setTimeout(() => {
                    setIsSearching(false);
                  }, 1800);
                }}
                onClose={handleCloseSearch}
              />
            )}
            {activeMode === "visual" && <VisualSearch />}
          </View>
        </Animated.View>
      )}

      {/* Floating Bottom Navigation & Search Dock */}
      {showDock && (
        <Animated.View
          style={[
            styles.dockWrap,
            {
              bottom: normalDockBottom,
              transform: [
                { translateY: Animated.multiply(keyboardShiftAnim, -1) },
              ],
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Vertical Floating Mode Options (Voice / Type / Visual on Feed) */}
          {searchOpen && !panelOpen && onFeed && (
            <View style={styles.modesPopup}>
              {SEARCH_OPTIONS.map(({ icon, label, mode }) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={`Search by ${label}`}
                  onPress={() => {
                    setSearchOpen(false);
                    setActiveMode(mode);
                    setIsListening(mode === "voice");
                  }}
                  style={({ pressed }) => [
                    styles.modeOptionRow,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.modeLabel, { color: colors.text }]}>
                    {label}
                  </Text>
                  <View
                    style={[
                      styles.modeCircle,
                      {
                        backgroundColor: colors.text,
                        shadowColor: colors.text,
                      },
                    ]}
                  >
                    <Ionicons name={icon} size={18} color={colors.bg} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Vertical Floating Feed Mode Options (Long-press Left Dock Button on Feed) */}
          {leftModeMenuOpen && !panelOpen && onFeed && (
            <View style={styles.leftModesPopup}>
              {FEED_MODE_OPTIONS.map(({ icon, label, desc, mode }) => {
                const isSelected = feedMode === mode;
                return (
                  <Pressable
                    key={mode}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${label}`}
                    onPress={() => {
                      setFeedMode(mode);
                      setLeftModeMenuOpen(false);
                      if (mode === "people") {
                        showToast("👥 Feed: People only (Lilongwe)");
                      } else if (mode === "places") {
                        showToast("🏢 Feed: Places, businesses & events");
                      } else {
                        showToast("🌐 Feed: All community activity");
                      }
                    }}
                    style={({ pressed }) => [
                      styles.leftModeOptionRow,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <View
                      style={[
                        styles.modeCircle,
                        {
                          backgroundColor: isSelected
                            ? colors.signal
                            : colors.text,
                          shadowColor: isSelected ? colors.signal : colors.text,
                        },
                      ]}
                    >
                      <Ionicons
                        name={icon}
                        size={18}
                        color={isSelected ? colors.signalForeground : colors.bg}
                      />
                    </View>
                    <View style={styles.leftModeTextWrap}>
                      <View style={styles.leftModeLabelRow}>
                        <Text
                          style={[
                            styles.modeLabel,
                            {
                              backgroundColor: colors.surface,
                              borderColor: isSelected
                                ? colors.signal
                                : colors.line,
                              borderWidth: 1,
                              color: colors.text,
                              fontWeight: isSelected ? "800" : "700",
                            },
                          ]}
                        >
                          {label}
                        </Text>
                        {isSelected && (
                          <View
                            style={[
                              styles.activeDot,
                              { backgroundColor: colors.signal },
                            ]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.modeDesc,
                          {
                            backgroundColor: colors.surfaceMuted,
                            borderColor: colors.line,
                            borderWidth: 1,
                            color: colors.muted,
                          },
                        ]}
                      >
                        {desc}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Vertical Floating Profile Options (Context-aware: own profile vs other users) */}
          {profileMenuOpen && onProfile && (
            <View style={styles.modesPopup}>
              {(isOtherUser ? OTHER_USER_OPTIONS : PROFILE_OPTIONS).map(
                ({ icon, label, id }) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={() => {
                      setProfileMenuOpen(false);
                      if (id === "settings") {
                        setProfileModal("settings");
                      } else if (id === "saved") {
                        setProfileModal("saved");
                      } else if (id === "share") {
                        Share.share({
                          message:
                            "Olive — Hyperlocal Social Calendar in Lilongwe",
                        });
                      } else if (id === "message") {
                        setMessageDraft("");
                        setMessageModalOpen(true);
                      } else if (id === "alerts") {
                        const isAlerted = !alertsMap[currentProfile.id];
                        setAlertsMap((prev) => ({
                          ...prev,
                          [currentProfile.id]: isAlerted,
                        }));
                        showToast(
                          isAlerted
                            ? `🔔 Alerts turned on for ${currentProfile.name}`
                            : `🔕 Alerts muted for ${currentProfile.name}`
                        );
                      } else if (id === "share_user") {
                        Share.share({
                          message: `Check out ${currentProfile.name} (${currentProfile.handle}) on Olive — Hyperlocal Social Calendar in Lilongwe!`,
                        });
                      } else if (id === "copy") {
                        showToast(
                          `🔗 Copied link: olive.app/${currentProfile.handle.replace(
                            "@",
                            ""
                          )}`
                        );
                      } else if (id === "report") {
                        setReportModalOpen(true);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.modeOptionRow,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.modeLabel, { color: colors.text }]}>
                      {label}
                    </Text>
                    <View
                      style={[
                        styles.modeCircle,
                        {
                          backgroundColor: colors.text,
                          shadowColor: colors.text,
                        },
                      ]}
                    >
                      <Ionicons name={icon} size={18} color={colors.bg} />
                    </View>
                  </Pressable>
                )
              )}
            </View>
          )}

          {/* Floating Pill Bar */}
          <View
            style={[
              styles.dockBar,
              {
                backgroundColor: colors.text,
                shadowColor: colors.text,
              },
            ]}
          >
            {/* Left Button: Back (on profile), Feed Mode Switcher (on feed), or Close (when search open) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                panelOpen || searchOpen
                  ? "Cancel search"
                  : onProfile
                  ? "Back to feed"
                  : onFeed
                  ? `Feed mode: ${feedMode}. Tap to cycle, hold for menu.`
                  : "Home feed"
              }
              onPress={handleLeftPill}
              onLongPress={handleLeftLongPress}
              delayLongPress={320}
              style={({ pressed }) => [
                styles.dockSideBtn,
                {
                  backgroundColor:
                    panelOpen || searchOpen
                      ? colors.signal
                      : onProfile
                      ? colors.bg
                      : leftModeMenuOpen
                      ? colors.signal
                      : colors.bg,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              {panelOpen || searchOpen ? (
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.signalForeground}
                />
              ) : onProfile ? (
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              ) : leftModeMenuOpen ? (
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.signalForeground}
                />
              ) : feedMode === "people" ? (
                <Ionicons name="people" size={20} color={colors.signal} />
              ) : feedMode === "places" ? (
                <Ionicons name="business" size={20} color={colors.signal} />
              ) : (
                <Ionicons name="layers" size={20} color={colors.text} />
              )}
            </Pressable>

            {/* Center Area: Input, Animating Line (loading/searching), or Resting Search State */}
            <View style={styles.dockCenter}>
              {activeMode === "type" && (
                <TextInput
                  autoFocus
                  value={typeQuery}
                  onChangeText={setTypeQuery}
                  placeholder="What do you need in Lilongwe?"
                  placeholderTextColor="rgba(255, 255, 255, 0.45)"
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    if (typeQuery.trim()) {
                      setIsSearching(true);
                      setTimeout(() => {
                        setIsSearching(false);
                      }, 1800);
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.dockInput, { color: colors.bg }]}
                />
              )}

              {activeMode === "type" && showAnimatingLine && (
                <View
                  style={styles.lineArea}
                  onLayout={(e: LayoutChangeEvent) => {
                    const w = e.nativeEvent.layout.width;
                    if (w > 0 && Math.abs(w - trackWidth) > 1) {
                      setTrackWidth(w);
                    }
                  }}
                >
                  {/* Continuous 2px Baseline Track with Scanning Sweep Beam */}
                  <View style={styles.baselineTrack}>
                    <Animated.View
                      style={[
                        styles.sweepBar,
                        {
                          width: barWidth,
                          backgroundColor: colors.signal,
                          transform: [{ translateX: sweepTranslateX }],
                          opacity: sweepOpacityAnim,
                        },
                      ]}
                    />
                  </View>

                  {/* Acoustic Voice / Sound Intake Waveform (Centered directly on baseline) */}
                  <Animated.View
                    pointerEvents={isVoice ? "auto" : "none"}
                    style={[
                      styles.voiceIntakeOverlay,
                      {
                        opacity: voiceOpacityAnim,
                        transform: [{ scaleY: voiceScaleYAnim }],
                      },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        isListening
                          ? "Voice intake active - tap to pause"
                          : "Voice intake paused - tap to resume"
                      }
                      onPress={() => setIsListening((l) => !l)}
                      style={styles.voiceTouchWrap}
                    >
                      <View style={styles.strandsRow}>
                        {strandInterpolations.map((scaleAnim, idx) => (
                          <Animated.View
                            key={idx}
                            style={[
                              styles.intakeStrand,
                              {
                                backgroundColor: colors.signal,
                                shadowColor: colors.signal,
                                transform: [{ scaleY: scaleAnim }],
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </Pressable>
                  </Animated.View>
                </View>
              )}
            </View>

            {/* Right Action Button: Profile options caret (on profile), Search / Send / Voice Toggle (on feed) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                onProfile
                  ? profileMenuOpen
                    ? "Close profile options"
                    : "Open profile options"
                  : panelOpen
                  ? activeMode === "voice"
                    ? isListening
                      ? "Stop listening"
                      : "Start listening"
                    : activeMode === "type"
                    ? "Submit"
                    : "Close"
                  : searchOpen
                  ? "Close search"
                  : "Open search"
              }
              onPress={handleSearchAction}
              style={({ pressed }) => [
                styles.dockSideBtn,
                {
                  backgroundColor: onProfile
                    ? profileMenuOpen
                      ? colors.signal
                      : colors.bg
                    : panelOpen || searchOpen
                    ? colors.signal
                    : colors.bg,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              {onProfile ? (
                <Ionicons
                  name={profileMenuOpen ? "close" : "chevron-up"}
                  size={profileMenuOpen ? 20 : 22}
                  color={
                    profileMenuOpen ? colors.signalForeground : colors.text
                  }
                />
              ) : panelOpen ? (
                activeMode === "voice" ? (
                  <Ionicons
                    name={isListening ? "mic" : "mic-outline"}
                    size={20}
                    color={colors.signalForeground}
                  />
                ) : activeMode === "type" ? (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={colors.signalForeground}
                  />
                ) : (
                  <Ionicons
                    name="close"
                    size={20}
                    color={colors.signalForeground}
                  />
                )
              ) : searchOpen ? (
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.signalForeground}
                />
              ) : (
                <Ionicons name="search" size={20} color={colors.signal} />
              )}
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Floating In-App Toast */}
      {toastMessage && (
        <View
          style={[
            styles.floatingToast,
            {
              backgroundColor: colors.text,
              bottom: normalDockBottom + 70,
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={16} color={colors.signal} />
          <Text style={[styles.floatingToastText, { color: colors.bg }]}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* Message Modal for Other Users/Businesses */}
      <Modal
        visible={messageModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMessageModalOpen(false)}
      >
        <View style={styles.actionModalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setMessageModalOpen(false)}
          />
          <View
            style={[
              styles.actionModalContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.signal,
              },
            ]}
          >
            <View style={styles.actionModalHeader}>
              <View style={styles.actionModalTitleRow}>
                <Image
                  source={currentProfile.avatar}
                  style={[
                    styles.actionModalAvatar,
                    { borderColor: colors.signal },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.actionModalTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    Message {currentProfile.name}
                  </Text>
                  <Text
                    style={[
                      styles.actionModalSubtitle,
                      { color: colors.muted },
                    ]}
                    numberOfLines={1}
                  >
                    {currentProfile.handle} · {currentProfile.neighborhood}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close message modal"
                onPress={() => setMessageModalOpen(false)}
                style={[
                  styles.actionModalCloseBtn,
                  { backgroundColor: colors.bg, borderColor: colors.line },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.actionModalBody}>
              <TextInput
                value={messageDraft}
                onChangeText={setMessageDraft}
                placeholder={`Ask about hours, table bookings, batch drops, or send a note to ${currentProfile.name}...`}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                style={[
                  styles.messageTextInput,
                  {
                    backgroundColor: colors.bg,
                    borderColor: colors.line,
                    color: colors.text,
                  },
                ]}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send message"
                onPress={() => {
                  setMessageModalOpen(false);
                  showToast(`Message delivered to ${currentProfile.name}!`);
                }}
                style={({ pressed }) => [
                  styles.actionSubmitBtn,
                  {
                    backgroundColor: colors.signal,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.actionSubmitBtnText}>Send Message</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalOpen(false)}
      >
        <View style={styles.actionModalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setReportModalOpen(false)}
          />
          <View
            style={[
              styles.actionModalContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.signal,
              },
            ]}
          >
            <View style={styles.actionModalHeader}>
              <View style={styles.actionModalTitleRow}>
                <View
                  style={[
                    styles.reportIconCircle,
                    { backgroundColor: "rgba(239, 68, 68, 0.15)" },
                  ]}
                >
                  <Ionicons name="flag" size={18} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.actionModalTitle, { color: colors.text }]}
                  >
                    Report Account
                  </Text>
                  <Text
                    style={[
                      styles.actionModalSubtitle,
                      { color: colors.muted },
                    ]}
                  >
                    {currentProfile.handle}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close report modal"
                onPress={() => setReportModalOpen(false)}
                style={[
                  styles.actionModalCloseBtn,
                  { backgroundColor: colors.bg, borderColor: colors.line },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.actionModalBody}>
              <Text
                style={[
                  styles.reportPromptText,
                  { color: colors.textSecondary },
                ]}
              >
                Select a reason for reporting this account:
              </Text>

              {[
                "Incorrect venue location or business hours",
                "Misleading or fraudulent drops",
                "Inappropriate or offensive content",
                "Permanently closed venue",
              ].map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => {
                    setReportModalOpen(false);
                    showToast(
                      "Report submitted. Thank you for keeping Olive safe!"
                    );
                  }}
                  style={({ pressed }) => [
                    styles.reportReasonRow,
                    {
                      borderColor: colors.line,
                      backgroundColor: pressed ? colors.bg : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[styles.reportReasonText, { color: colors.text }]}
                  >
                    {reason}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.muted}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Global In-App Turn-By-Turn Guidance Experience */}
      <GuidanceModal />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
  },
  panelContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 45,
  },
  panelCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  dockWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 50,
  },
  modesPopup: {
    position: "absolute",
    bottom: 74,
    right: 0,
    gap: 14,
    alignItems: "flex-end",
  },
  leftModesPopup: {
    position: "absolute",
    bottom: 74,
    left: 0,
    gap: 12,
    alignItems: "flex-start",
  },
  leftModeOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  leftModeTextWrap: {
    gap: 2,
  },
  leftModeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeDesc: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  dockRestingCenter: {
    width: "100%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  dockRestingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  dockRestingText: {
    fontSize: 12.5,
    fontWeight: "600",
    opacity: 0.9,
  },
  modeOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    overflow: "hidden",
  },
  modeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dockBar: {
    width: "100%",
    maxWidth: 400,
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  dockSideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dockCenter: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  dockInput: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#FF6326",
  },
  lineArea: {
    width: "100%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  baselineTrack: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 1,
    overflow: "hidden",
    position: "relative",
  },
  sweepBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    height: "100%",
    borderRadius: 1,
  },
  voiceIntakeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceTouchWrap: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  strandsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  intakeStrand: {
    width: 2.5,
    height: 20,
    marginHorizontal: 1.5,
    borderRadius: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 3,
    elevation: 2,
  },

  /* Action Modals & Floating Toast */
  floatingToast: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingToastText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  actionModalContainer: {
    width: "100%",
    borderRadius: 32,
    borderWidth: 2,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  actionModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionModalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  actionModalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  reportIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionModalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionModalSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  actionModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionModalBody: {
    gap: 12,
  },
  messageTextInput: {
    minHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    textAlignVertical: "top",
  },
  actionSubmitBtn: {
    height: 46,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  reportPromptText: {
    fontSize: 13,
    marginBottom: 4,
  },
  reportReasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  reportReasonText: {
    fontSize: 13.5,
    fontWeight: "500",
    flex: 1,
  },
});

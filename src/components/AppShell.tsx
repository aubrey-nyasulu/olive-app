import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  type KeyboardEvent,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive } from "../context/OliveProvider";
import { GuidanceModal } from "./GuidanceModal";
import { TypeSearch, VisualSearch, VoiceSearch } from "./SearchModes";

const SEARCH_OPTIONS = [
  { icon: "mic" as const, label: "Voice", mode: "voice" as const },
  { icon: "keypad" as const, label: "Type", mode: "type" as const },
  { icon: "camera" as const, label: "Visual", mode: "visual" as const },
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
    searchOpen,
    setSearchOpen,
    activeMode,
    setActiveMode,
    isListening,
    setIsListening,
    typeQuery,
    setTypeQuery,
    closeSearch,
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
  const onFeed = pathname === "/";
  const onProfile = pathname === "/profile";
  const showDock = onFeed || onProfile;
  const panelOpen = activeMode !== null;

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

  // 1. Line Sweep Animation (3.4s linear infinite, representing active scanning)
  useEffect(() => {
    const sweepLoop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 3400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    sweepLoop.start();
    return () => sweepLoop.stop();
  }, [sweepAnim]);

  // 2. Signal Dot Pulse Animation (2s ease-in-out infinite)
  useEffect(() => {
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
  }, [dotPulseAnim]);

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
        : Math.max(0, kh + 12 - normalDockBottom);

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
    closeSearch();
  };

  const handleSearchAction = () => {
    if (panelOpen) {
      if (activeMode === "voice") {
        setIsListening((l) => !l);
      } else if (activeMode === "type") {
        Keyboard.dismiss();
      } else {
        handleCloseSearch();
      }
    } else {
      setSearchOpen((prev) => !prev);
    }
  };

  const handleLeftPill = () => {
    Keyboard.dismiss();
    if (panelOpen || searchOpen) {
      closeSearch();
    } else if (!onFeed) {
      router.navigate("/");
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

      {/* Dimmed backdrop when search is open */}
      {(searchOpen || panelOpen) && (
        <Pressable
          accessibilityLabel="Dismiss search"
          onPress={handleCloseSearch}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        />
      )}

      {/* Mode Search Content Panel */}
      {panelOpen && (
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
                onSelectCategory={(cat) => setTypeQuery(cat)}
                onClose={handleCloseSearch}
              />
            )}
            {activeMode === "voice" && <VoiceSearch listening={isListening} />}
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
          {/* Vertical Floating Mode Options (Voice / Type / Visual) */}
          {searchOpen && !panelOpen && (
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
            {/* Left Button: Feed / Home or Dismiss */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={panelOpen ? "Cancel search" : "Home feed"}
              onPress={handleLeftPill}
              style={({ pressed }) => [
                styles.dockSideBtn,
                {
                  backgroundColor:
                    panelOpen || searchOpen
                      ? colors.signal
                      : onFeed
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
              ) : (
                <Animated.View
                  style={[
                    styles.signalDot,
                    {
                      backgroundColor: onFeed
                        ? colors.signalForeground
                        : colors.signal,
                      opacity: dotPulseAnim,
                    },
                  ]}
                />
              )}
            </Pressable>

            {/* Center Area: Input, or Shapeshifting Line (Scanning <-> Sound Intake) */}
            <View style={styles.dockCenter}>
              {activeMode === "type" ? (
                <TextInput
                  autoFocus
                  value={typeQuery}
                  onChangeText={setTypeQuery}
                  placeholder="What do you need?"
                  placeholderTextColor="rgba(255, 255, 255, 0.45)"
                  returnKeyType="search"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.dockInput, { color: colors.bg }]}
                />
              ) : (
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

            {/* Right Action Button: Search Trigger / Send / Voice Toggle */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                panelOpen
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
                  backgroundColor:
                    panelOpen || searchOpen ? colors.signal : colors.bg,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              {panelOpen ? (
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
});

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  type KeyboardEvent,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive, type FeedMode } from "../context/OliveProvider";
import { getProfile, type UserProfile } from "../profiles";
import { GuidanceModal } from "./GuidanceModal";
import { TypeSearch, VisualSearch } from "./SearchModes";
import { CATEGORIES, POSTS, relatedPosts, REVIEWS } from "../places";
import type { Post } from "../models";

const userAvatar = require("../../assets/images/profile-avatar.jpg");

const RADII = [1, 2, 5, 10, 20];
const MODES = [
  { key: "walking" as const, label: "Walking" },
  { key: "cycling" as const, label: "Cycling" },
  { key: "driving" as const, label: "Driving" },
];

const SEARCH_OPTIONS = [
  { icon: "mic" as const, label: "Voice", mode: "voice" as const },
  { icon: "keypad" as const, label: "Type", mode: "type" as const },
  { icon: "camera" as const, label: "Visual", mode: "visual" as const },
];

const FEED_MODE_OPTIONS = [
  {
    icon: "layers" as const,
    label: "All Activity",
    desc: "Both people & places in Lilongwe",
    mode: "all" as const,
  },
  {
    icon: "people" as const,
    label: "People Only",
    desc: "Guides, locals & morning cyclists",
    mode: "people" as const,
  },
  {
    icon: "business" as const,
    label: "Places & Events",
    desc: "Bakeries, braais & live sessions",
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
  const weight = Math.cos(normDist * (Math.PI / 2)) ** 1.6;
  const lfoIndex = (i * 3) % LFO_DURATIONS.length;
  return { dist, weight, lfoIndex };
});

export function AppShell({ children }: { children: ReactNode }) {
  const {
    config,
    colors,
    savedIds,
    toggleSave,
    updateSettings,
    resetSettings,
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
    isScanning,
    setIsScanning,
    expandedWindow,
    openExpandedWindow,
    closeExpandedWindow,
    reviewsMap,
    addReview,
    startGuidance,
  } = useOlive();

  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(Dimensions.get("window").height);
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Draft states for expanded dock inputs
  const [commentDraft, setCommentDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [alertsMap, setAlertsMap] = useState<Record<string, boolean>>({});

  // 2.6s initial loading timer upon opening app
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  const showAnimatingLine = isInitialLoading || isSearching || isScanning;

  // In-App Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const isVoice = activeMode === "voice";

  // Track layout width for sweeping line
  const [trackWidth, setTrackWidth] = useState(140);
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const dotPulseAnim = useRef(new Animated.Value(1)).current;

  // Morph animations for audio/scanning
  const voiceOpacityAnim = useRef(new Animated.Value(0)).current;
  const voiceScaleYAnim = useRef(new Animated.Value(0)).current;
  const sweepOpacityAnim = useRef(new Animated.Value(1)).current;

  // Acoustic LFO Oscillators
  const lfoValues = useRef(LFO_DURATIONS.map(() => new Animated.Value(0))).current;

  // Dock Height Expansion Animation
  const isExpanded = expandedWindow !== null;
  const dockExpandedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isExpanded) {
      Animated.spring(dockExpandedAnim, {
        toValue: 1,
        friction: 9,
        tension: 65,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(dockExpandedAnim, {
        toValue: 0,
        friction: 10,
        tension: 75,
        useNativeDriver: false,
      }).start();
    }
  }, [isExpanded, dockExpandedAnim]);

  // Saved posts list
  const savedPosts = useMemo(
    () => POSTS.filter((p) => savedIds.includes(p.id)),
    [savedIds]
  );

  // Line sweep loop
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

  // Dot pulse loop
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

  // Acoustic LFO loops
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

  // Shapeshift between Scanning Line & Voice Intake Wave
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
          toValue: showAnimatingLine ? 1 : 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    isVoice,
    isListening,
    showAnimatingLine,
    sweepOpacityAnim,
    voiceOpacityAnim,
    voiceScaleYAnim,
  ]);

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

  const barWidth = Math.max(45, trackWidth * 0.42);
  const sweepTranslateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-barWidth, trackWidth + barWidth],
  });

  // Screen dimensions
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setScreenHeight(window.height);
    });
    return () => sub.remove();
  }, []);

  // Keyboard avoidance
  useEffect(() => {
    const handleShow = (e: KeyboardEvent) => {
      const kh = e.endCoordinates.height;
      if (!kh || kh <= 0) return;
      setKeyboardHeight(kh);

      const windowDidResize =
        initialRootHeightRef.current > 0 &&
        initialRootHeightRef.current - rootHeight >= kh * 0.6;

      const shift = windowDidResize ? 0 : Math.max(0, kh + 32 - normalDockBottom);
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
      Platform.OS === "ios" ? ["keyboardWillShow"] : ["keyboardWillShow", "keyboardDidShow"];
    const hideEvents: ("keyboardWillHide" | "keyboardDidHide")[] =
      Platform.OS === "ios" ? ["keyboardWillHide"] : ["keyboardWillHide", "keyboardDidHide"];

    const subs = [
      ...showEvents.map((ev) => Keyboard.addListener(ev, handleShow)),
      ...hideEvents.map((ev) => Keyboard.addListener(ev, handleHide)),
    ];
    return () => subs.forEach((s) => s.remove());
  }, [keyboardShiftAnim, normalDockBottom, rootHeight]);

  // Heights calculation
  const expandedMaxHeight = Math.min(
    keyboardHeight > 0
      ? screenHeight - keyboardHeight - insets.top - 40
      : screenHeight * 0.72,
    520
  );

  const maxPanelHeight = Math.max(
    160,
    screenHeight -
      (keyboardHeight > 0 ? keyboardHeight + 110 : normalDockBottom + 100) -
      insets.top -
      50
  );

  const dockHeight = dockExpandedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [64, Math.max(280, expandedMaxHeight)],
  });

  const contentOpacity = dockExpandedAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  const restingBarOpacity = dockExpandedAnim.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0, 0],
  });

  // Action Handlers
  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setProfileMenuOpen(false);
    closeSearch();
  };

  const handleSendComment = () => {
    if (commentDraft.trim() && expandedWindow?.type === "comments") {
      addReview(expandedWindow.post.id, {
        by: "Chisomo Banda",
        stars: 5,
        text: commentDraft.trim(),
      });
      setCommentDraft("");
      Keyboard.dismiss();
      showToast(`Review added for ${expandedWindow.post.author}!`);
    }
  };

  const handleSendMessage = () => {
    if (messageDraft.trim() && expandedWindow?.type === "message") {
      const recipientName = expandedWindow.recipient.name;
      setMessageDraft("");
      closeExpandedWindow();
      Keyboard.dismiss();
      showToast(`Message delivered to ${recipientName}!`);
    }
  };

  const handleRightPress = () => {
    Keyboard.dismiss();
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
        setTimeout(() => setIsSearching(false), 1800);
      } else {
        handleCloseSearch();
      }
    } else if (searchOpen) {
      setSearchOpen(false);
    } else if (onFeed) {
      const nextState = !isScanning;
      setIsScanning(nextState);
      if (nextState) {
        showToast("🟢 Realtime feed sync active");
      } else {
        showToast("⏸️ Realtime feed sync paused");
      }
    }
  };

  const handleRightLongPress = () => {
    if (onFeed && !panelOpen) {
      openExpandedWindow({ type: "search_options" });
    }
  };

  const handleLeftPill = () => {
    Keyboard.dismiss();
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
      const nextMode: FeedMode =
        feedMode === "all" ? "people" : feedMode === "people" ? "places" : "all";
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
      openExpandedWindow({ type: "feed_modes" });
    }
  };

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0) {
          if (!initialRootHeightRef.current || h > initialRootHeightRef.current) {
            initialRootHeightRef.current = h;
          }
          setRootHeight(h);
        }
      }}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <View style={styles.contentWrap}>{children}</View>

      {/* Dimmed backdrop when expanded window or options are open */}
      {(isExpanded || searchOpen || panelOpen || profileMenuOpen) && (
        <Pressable
          accessibilityLabel="Dismiss options"
          onPress={() => {
            closeExpandedWindow();
            handleCloseSearch();
          }}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        />
      )}

      {/* Mode Search Content Panel (Voice/Type/Visual) */}
      {panelOpen && activeMode !== "voice" && (
        <Animated.View
          style={[
            styles.panelContainer,
            {
              bottom: normalPanelBottom,
              maxHeight: maxPanelHeight,
              transform: [{ translateY: Animated.multiply(keyboardShiftAnim, -1) }],
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
                  setTimeout(() => setIsSearching(false), 1800);
                }}
                onClose={handleCloseSearch}
              />
            )}
            {activeMode === "visual" && <VisualSearch />}
          </View>
        </Animated.View>
      )}

      {/* Floating Bottom Navigation & Expanding Window Container */}
      {showDock && (
        <Animated.View
          style={[
            styles.dockWrap,
            {
              bottom: normalDockBottom,
              transform: [{ translateY: Animated.multiply(keyboardShiftAnim, -1) }],
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Vertical Profile Options Popup */}
          {profileMenuOpen && onProfile && (
            <View style={styles.modesPopup}>
              {(isOtherUser ? OTHER_USER_OPTIONS : PROFILE_OPTIONS).map(
                ({ icon, label, id: optId }) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={() => {
                      setProfileMenuOpen(false);
                      if (optId === "settings") {
                        openExpandedWindow({ type: "profile_settings" });
                      } else if (optId === "saved") {
                        openExpandedWindow({ type: "profile_saved" });
                      } else if (optId === "share") {
                        Share.share({
                          message: "Olive — Hyperlocal Social Calendar in Lilongwe",
                        });
                      } else if (optId === "message") {
                        setMessageDraft("");
                        openExpandedWindow({ type: "message", recipient: currentProfile });
                      } else if (optId === "alerts") {
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
                      } else if (optId === "share_user") {
                        Share.share({
                          message: `Check out ${currentProfile.name} (${currentProfile.handle}) on Olive!`,
                        });
                      } else if (optId === "copy") {
                        showToast(`🔗 Copied: olive.app/${currentProfile.handle.replace("@", "")}`);
                      } else if (optId === "report") {
                        openExpandedWindow({ type: "report", targetUser: currentProfile });
                      }
                    }}
                    style={({ pressed }) => [
                      styles.modeOptionRow,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.modeLabel, { color: colors.text }]}>{label}</Text>
                    <View
                      style={[
                        styles.modeCircle,
                        { backgroundColor: colors.text, shadowColor: colors.text },
                      ]}
                    >
                      <Ionicons name={icon} size={18} color={colors.bg} />
                    </View>
                  </Pressable>
                )
              )}
            </View>
          )}

          {/* Morphing Floating Nav Card */}
          <Animated.View
            style={[
              styles.dockCard,
              {
                height: dockHeight,
                backgroundColor: isExpanded ? colors.surface : colors.text,
                borderColor: isExpanded ? colors.line : "transparent",
                borderWidth: isExpanded ? 1.5 : 0,
                shadowColor: isExpanded ? colors.overlay : colors.text,
              },
            ]}
          >
            {/* 1. EXPANDED CONTENT VIEW (Shown when dock height expands) */}
            {isExpanded && (
              <Animated.View style={[styles.expandedContentWrap, { opacity: contentOpacity }]}>
                {/* Drag Handle & Dismiss Header */}
                <View style={styles.expandedTopHandleWrap}>
                  <View style={[styles.expandedTopHandle, { backgroundColor: colors.line }]} />
                  <Pressable
                    accessibilityLabel="Close expanded nav"
                    onPress={closeExpandedWindow}
                    style={[styles.expandedCloseBtn, { backgroundColor: colors.surfaceMuted }]}
                  >
                    <Ionicons name="close" size={16} color={colors.text} />
                  </Pressable>
                </View>

                {/* --- A. COMMENTS VIEW --- */}
                {expandedWindow?.type === "comments" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.expandedTitle, { color: colors.text }]}>
                          Reviews & Comments
                        </Text>
                        <Text style={[styles.expandedSubtitle, { color: colors.muted }]} numberOfLines={1}>
                          {expandedWindow.post.author} · {expandedWindow.post.place}
                        </Text>
                      </View>
                      <View style={[styles.countBadge, { backgroundColor: colors.surfaceMuted }]}>
                        <Text style={[styles.countBadgeText, { color: colors.signal }]}>
                          {(reviewsMap[expandedWindow.post.id] ?? REVIEWS[expandedWindow.post.id] ?? []).length} notes
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      style={styles.expandedScroll}
                      contentContainerStyle={styles.expandedScrollContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      {(reviewsMap[expandedWindow.post.id] ?? REVIEWS[expandedWindow.post.id] ?? []).length === 0 ? (
                        <View style={styles.emptyContainer}>
                          <Ionicons name="chatbubble-ellipses-outline" size={38} color={colors.muted} />
                          <Text style={[styles.emptyTitle, { color: colors.text }]}>No reviews yet</Text>
                          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                            Be the first in Lilongwe to visit and share thoughts below!
                          </Text>
                        </View>
                      ) : (
                        (reviewsMap[expandedWindow.post.id] ?? REVIEWS[expandedWindow.post.id] ?? []).map((rev, idx) => (
                          <View
                            key={`${rev.by}-${idx}`}
                            style={[styles.reviewItemCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}
                          >
                            <View style={styles.reviewItemTop}>
                              <View style={[styles.reviewAvatarCircle, { backgroundColor: colors.surface }]}>
                                {rev.by === "Chisomo Banda" ? (
                                  <Image source={userAvatar} style={styles.avatarImgSmall} />
                                ) : (
                                  <Text style={[styles.reviewAvatarLetter, { color: colors.text }]}>
                                    {rev.by[0]}
                                  </Text>
                                )}
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.reviewAuthorName, { color: colors.text }]}>
                                  {rev.by}
                                </Text>
                                <View style={styles.reviewStarsRow}>
                                  {Array.from({ length: rev.stars }).map((_, i) => (
                                    <Ionicons key={i} name="star" size={11} color={colors.signal} />
                                  ))}
                                </View>
                              </View>
                            </View>
                            <Text style={[styles.reviewItemText, { color: colors.textSecondary }]}>
                              {rev.text}
                            </Text>
                          </View>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* --- B. DETAILS VIEW --- */}
                {expandedWindow?.type === "details" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.expandedTitle, { color: colors.text }]}>
                          {expandedWindow.post.title}
                        </Text>
                        <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>
                          {expandedWindow.post.author} · {expandedWindow.post.category}
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      style={styles.expandedScroll}
                      contentContainerStyle={styles.expandedScrollContent}
                      showsVerticalScrollIndicator={false}
                    >
                      <Text style={[styles.detailsBodyText, { color: colors.textSecondary }]}>
                        {expandedWindow.post.body}
                      </Text>

                      <View style={[styles.detailsGrid, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}>
                        <View style={styles.detailsGridRow}>
                          <Ionicons name="location-outline" size={16} color={colors.signal} />
                          <Text style={[styles.detailsGridLabel, { color: colors.muted }]}>Location</Text>
                          <Text style={[styles.detailsGridVal, { color: colors.text }]}>{expandedWindow.post.place}</Text>
                        </View>
                        <View style={styles.detailsGridRow}>
                          <Ionicons name="time-outline" size={16} color={colors.signal} />
                          <Text style={[styles.detailsGridLabel, { color: colors.muted }]}>Hours</Text>
                          <Text style={[styles.detailsGridVal, { color: colors.text }]}>{expandedWindow.post.when}</Text>
                        </View>
                        <View style={styles.detailsGridRow}>
                          <Ionicons name="navigate-outline" size={16} color={colors.signal} />
                          <Text style={[styles.detailsGridLabel, { color: colors.muted }]}>Distance</Text>
                          <Text style={[styles.detailsGridVal, { color: colors.text }]}>{expandedWindow.post.distanceKm} km away</Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => {
                          const p = expandedWindow.post;
                          closeExpandedWindow();
                          startGuidance(p);
                        }}
                        style={[styles.expandedPrimaryBtn, { backgroundColor: colors.signal }]}
                      >
                        <Ionicons name="navigate" size={16} color={colors.signalForeground} />
                        <Text style={[styles.expandedPrimaryBtnText, { color: colors.signalForeground }]}>
                          Start In-App Navigation
                        </Text>
                      </Pressable>
                    </ScrollView>
                  </View>
                )}

                {/* --- C. RELATED VIEW --- */}
                {expandedWindow?.type === "related" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <Text style={[styles.expandedTitle, { color: colors.text }]}>
                        Similar Places Nearby
                      </Text>
                      <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>
                        Discovered around {expandedWindow.post.place}
                      </Text>
                    </View>

                    <ScrollView
                      style={styles.expandedScroll}
                      contentContainerStyle={styles.expandedScrollContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {relatedPosts(expandedWindow.post).map((rel) => (
                        <Pressable
                          key={rel.id}
                          onPress={() => {
                            closeExpandedWindow();
                            router.push(`/p/${rel.id}`);
                          }}
                          style={[styles.relatedItemCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}
                        >
                          <Image source={rel.image} style={styles.relatedItemThumb} />
                          <View style={{ flex: 1, gap: 2 }}>
                            <Text style={[styles.relatedItemTitle, { color: colors.text }]} numberOfLines={1}>
                              {rel.title}
                            </Text>
                            <Text style={[styles.relatedItemSubtitle, { color: colors.muted }]} numberOfLines={1}>
                              {rel.author} · {rel.place}
                            </Text>
                          </View>
                          <Text style={[styles.relatedItemDist, { color: colors.signal }]}>
                            {rel.distanceKm} km
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* --- D. PROFILE SAVED PLACES VIEW --- */}
                {expandedWindow?.type === "profile_saved" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <View>
                        <Text style={[styles.expandedTitle, { color: colors.text }]}>
                          Saved Places
                        </Text>
                        <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>
                          {savedPosts.length} places saved for quick access
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          Share.share({
                            message: `My favorite places in Lilongwe: ${savedPosts.map((p) => p.author).join(", ")} on Olive!`,
                          });
                        }}
                        style={[styles.headerShareBtn, { backgroundColor: colors.surfaceMuted }]}
                      >
                        <Ionicons name="share-social-outline" size={14} color={colors.text} />
                        <Text style={[styles.headerShareText, { color: colors.text }]}>Share</Text>
                      </Pressable>
                    </View>

                    <ScrollView
                      style={styles.expandedScroll}
                      contentContainerStyle={styles.expandedScrollContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {savedPosts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                          <Ionicons name="bookmark-outline" size={38} color={colors.muted} />
                          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing saved yet</Text>
                          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                            Tap the bookmark icon on any post in the feed to save it here.
                          </Text>
                        </View>
                      ) : (
                        savedPosts.map((post) => (
                          <View
                            key={post.id}
                            style={[styles.savedItemRow, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}
                          >
                            <Pressable
                              onPress={() => {
                                closeExpandedWindow();
                                router.push(`/p/${post.id}`);
                              }}
                              style={styles.savedItemPressable}
                            >
                              <Image source={post.image} style={styles.savedItemThumb} />
                              <View style={{ flex: 1, gap: 2 }}>
                                <Text style={[styles.savedItemTitle, { color: colors.text }]} numberOfLines={1}>
                                  {post.author}
                                </Text>
                                <Text style={[styles.savedItemSub, { color: colors.muted }]} numberOfLines={1}>
                                  {post.place} · {post.distanceKm} km
                                </Text>
                              </View>
                            </Pressable>
                            <Pressable
                              onPress={() => toggleSave(post.id)}
                              style={styles.savedItemTrashBtn}
                            >
                              <Ionicons name="trash-outline" size={17} color={colors.muted} />
                            </Pressable>
                          </View>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* --- E. PROFILE SETTINGS VIEW --- */}
                {expandedWindow?.type === "profile_settings" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <Text style={[styles.expandedTitle, { color: colors.text }]}>
                        Preferences & Filters
                      </Text>
                      <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>
                        Search radius, transit modes, and notifications
                      </Text>
                    </View>

                    <ScrollView
                      style={styles.expandedScroll}
                      contentContainerStyle={styles.expandedScrollContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {/* Search Radius */}
                      <View style={styles.settingsSection}>
                        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Search Radius</Text>
                        <Text style={[styles.settingsSectionHint, { color: colors.muted }]}>
                          How far Olive looks when you discover nearby
                        </Text>
                        <View style={styles.settingsPillsRow}>
                          {RADII.map((r) => (
                            <Pressable
                              key={r}
                              onPress={() => updateSettings({ radiusKm: r })}
                              style={[
                                styles.settingPill,
                                {
                                  backgroundColor: config.radiusKm === r ? colors.signal : colors.surfaceMuted,
                                  borderColor: config.radiusKm === r ? colors.signal : colors.line,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.settingPillText,
                                  { color: config.radiusKm === r ? colors.signalForeground : colors.text },
                                ]}
                              >
                                {r} km
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {/* Lanes / Categories */}
                      <View style={styles.settingsSection}>
                        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Categories</Text>
                        <Text style={[styles.settingsSectionHint, { color: colors.muted }]}>
                          Olive prioritizes these lane drops
                        </Text>
                        <View style={styles.settingsPillsRow}>
                          {CATEGORIES.map((cat) => {
                            const active = config.lanes.includes(cat);
                            return (
                              <Pressable
                                key={cat}
                                onPress={() => {
                                  const nextLanes = active
                                    ? config.lanes.filter((l) => l !== cat)
                                    : [...config.lanes, cat];
                                  updateSettings({ lanes: nextLanes });
                                }}
                                style={[
                                  styles.settingPill,
                                  {
                                    backgroundColor: active ? colors.signal : colors.surfaceMuted,
                                    borderColor: active ? colors.signal : colors.line,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.settingPillText,
                                    { color: active ? colors.signalForeground : colors.text },
                                  ]}
                                >
                                  {cat}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>

                      {/* Travel Mode */}
                      <View style={styles.settingsSection}>
                        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Getting Around</Text>
                        <View style={styles.settingsPillsRow}>
                          {MODES.map(({ key, label }) => (
                            <Pressable
                              key={key}
                              onPress={() => updateSettings({ mode: key })}
                              style={[
                                styles.settingPill,
                                {
                                  backgroundColor: config.mode === key ? colors.signal : colors.surfaceMuted,
                                  borderColor: config.mode === key ? colors.signal : colors.line,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.settingPillText,
                                  { color: config.mode === key ? colors.signalForeground : colors.text },
                                ]}
                              >
                                {label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {/* Appearance & Alerts */}
                      <View style={[styles.settingToggleCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.settingToggleTitle, { color: colors.text }]}>Dark Theme</Text>
                          <Text style={[styles.settingToggleSub, { color: colors.muted }]}>Warm high-contrast palette</Text>
                        </View>
                        <Switch
                          value={config.dark}
                          onValueChange={(val) => updateSettings({ dark: val })}
                          trackColor={{ false: colors.line, true: colors.signal }}
                          thumbColor="#FFFFFF"
                        />
                      </View>

                      <View style={[styles.settingToggleCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.settingToggleTitle, { color: colors.text }]}>Push Alerts</Text>
                          <Text style={[styles.settingToggleSub, { color: colors.muted }]}>Walking radius live drop notifications</Text>
                        </View>
                        <Switch
                          value={config.alerts}
                          onValueChange={(val) => updateSettings({ alerts: val })}
                          trackColor={{ false: colors.line, true: colors.signal }}
                          thumbColor="#FFFFFF"
                        />
                      </View>

                      <Pressable onPress={resetSettings} style={styles.resetSettingsBtn}>
                        <Text style={[styles.resetSettingsText, { color: colors.muted }]}>Reset to defaults</Text>
                      </Pressable>
                    </ScrollView>
                  </View>
                )}

                {/* --- F. MESSAGE VIEW --- */}
                {expandedWindow?.type === "message" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Image source={expandedWindow.recipient.avatar} style={styles.messageRecipientAvatar} />
                        <View>
                          <Text style={[styles.expandedTitle, { color: colors.text }]}>
                            Message {expandedWindow.recipient.name}
                          </Text>
                          <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>
                            {expandedWindow.recipient.handle} · {expandedWindow.recipient.neighborhood}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <ScrollView
                      style={styles.expandedScroll}
                      contentContainerStyle={styles.expandedScrollContent}
                      keyboardShouldPersistTaps="handled"
                    >
                      <View style={[styles.messageHintCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}>
                        <Ionicons name="sparkles" size={16} color={colors.signal} />
                        <Text style={[styles.messageHintText, { color: colors.textSecondary }]}>
                          Ask about table reservations, daily lake catches, fresh sourdough batches, or send a note to {expandedWindow.recipient.name}.
                        </Text>
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* --- G. REPORT VIEW --- */}
                {expandedWindow?.type === "report" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <Text style={[styles.expandedTitle, { color: colors.text }]}>Report Account</Text>
                      <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>
                        {expandedWindow.targetUser.handle}
                      </Text>
                    </View>

                    <ScrollView style={styles.expandedScroll} contentContainerStyle={styles.expandedScrollContent}>
                      {[
                        "Incorrect venue location or business hours",
                        "Misleading or fraudulent drops",
                        "Inappropriate or offensive content",
                        "Permanently closed venue",
                      ].map((reason) => (
                        <Pressable
                          key={reason}
                          onPress={() => {
                            closeExpandedWindow();
                            showToast("Report submitted. Thank you for keeping Olive safe!");
                          }}
                          style={[styles.reportRow, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}
                        >
                          <Text style={[styles.reportRowText, { color: colors.text }]}>{reason}</Text>
                          <Ionicons name="chevron-forward" size={15} color={colors.muted} />
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* --- H. FEED MODES VIEW --- */}
                {expandedWindow?.type === "feed_modes" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <Text style={[styles.expandedTitle, { color: colors.text }]}>Select Feed Mode</Text>
                      <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>Choose what appears in your stream</Text>
                    </View>

                    <View style={{ gap: 10, paddingHorizontal: 16, paddingTop: 6 }}>
                      {FEED_MODE_OPTIONS.map(({ icon, label, desc, mode }) => {
                        const isSelected = feedMode === mode;
                        return (
                          <Pressable
                            key={mode}
                            onPress={() => {
                              setFeedMode(mode);
                              closeExpandedWindow();
                              if (mode === "people") {
                                showToast("👥 Feed: People only (Lilongwe)");
                              } else if (mode === "places") {
                                showToast("🏢 Feed: Places, businesses & events");
                              } else {
                                showToast("🌐 Feed: All community activity");
                              }
                            }}
                            style={[
                              styles.modeCardItem,
                              {
                                backgroundColor: isSelected ? colors.signalLight : colors.surfaceMuted,
                                borderColor: isSelected ? colors.signal : colors.line,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.modeCardIcon,
                                { backgroundColor: isSelected ? colors.signal : colors.surface },
                              ]}
                            >
                              <Ionicons
                                name={icon}
                                size={20}
                                color={isSelected ? colors.signalForeground : colors.text}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.modeCardLabel,
                                  { color: isSelected ? colors.signal : colors.text, fontWeight: "700" },
                                ]}
                              >
                                {label}
                              </Text>
                              <Text style={[styles.modeCardDesc, { color: colors.muted }]}>{desc}</Text>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={20} color={colors.signal} />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* --- I. SEARCH OPTIONS VIEW --- */}
                {expandedWindow?.type === "search_options" && (
                  <View style={styles.expandedSectionContainer}>
                    <View style={styles.expandedSectionHeader}>
                      <Text style={[styles.expandedTitle, { color: colors.text }]}>Search & Sync Controls</Text>
                      <Text style={[styles.expandedSubtitle, { color: colors.muted }]}>
                        Toggle realtime sync or launch search
                      </Text>
                    </View>

                    <View style={{ gap: 10, paddingHorizontal: 16, paddingTop: 6 }}>
                      <Pressable
                        onPress={() => {
                          const nextState = !isScanning;
                          setIsScanning(nextState);
                          closeExpandedWindow();
                          showToast(
                            nextState ? "🟢 Realtime feed sync active" : "⏸️ Realtime feed sync paused"
                          );
                        }}
                        style={[
                          styles.modeCardItem,
                          {
                            backgroundColor: isScanning ? colors.signalLight : colors.surfaceMuted,
                            borderColor: isScanning ? colors.signal : colors.line,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.modeCardIcon,
                            { backgroundColor: isScanning ? colors.signal : colors.surface },
                          ]}
                        >
                          <Ionicons
                            name={isScanning ? "radio" : "radio-outline"}
                            size={20}
                            color={isScanning ? colors.signalForeground : colors.text}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.modeCardLabel,
                              { color: isScanning ? colors.signal : colors.text, fontWeight: "700" },
                            ]}
                          >
                            {isScanning ? "Live Feed Sync: Active" : "Live Feed Sync: Paused"}
                          </Text>
                          <Text style={[styles.modeCardDesc, { color: colors.muted }]}>
                            {isScanning ? "Auto-refreshing drops in Lilongwe" : "Tap to stream live"}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.activeDot,
                            { backgroundColor: isScanning ? colors.signal : colors.muted },
                          ]}
                        />
                      </Pressable>

                      {SEARCH_OPTIONS.map(({ icon, label, mode }) => (
                        <Pressable
                          key={label}
                          onPress={() => {
                            closeExpandedWindow();
                            setActiveMode(mode);
                            setIsListening(mode === "voice");
                          }}
                          style={[styles.modeCardItem, { backgroundColor: colors.surfaceMuted, borderColor: colors.line }]}
                        >
                          <View style={[styles.modeCardIcon, { backgroundColor: colors.surface }]}>
                            <Ionicons name={icon} size={20} color={colors.text} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.modeCardLabel, { color: colors.text }]}>{label} Search</Text>
                            <Text style={[styles.modeCardDesc, { color: colors.muted }]}>
                              {mode === "voice"
                                ? "Acoustic speech intake"
                                : mode === "type"
                                ? "Keywords, venues & categories"
                                : "Point camera to scan surroundings"}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            {/* 2. DOCK BAR (Contextual Bottom Action Bar when expanded, standard bar when resting) */}
            {isExpanded ? (
              <Animated.View
                style={[
                  styles.dockBar,
                  styles.expandedBottomDockBar,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.line,
                    borderTopWidth: 1,
                    opacity: contentOpacity,
                  },
                ]}
              >
                {/* CONTEXTUAL LEFT BUTTON */}
                {expandedWindow?.type === "comments" || expandedWindow?.type === "message" ? (
                  <View style={[styles.dockAvatarCircle, { borderColor: colors.signal }]}>
                    <Image source={userAvatar} style={styles.dockAvatarPhoto} />
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close expanded nav"
                    onPress={closeExpandedWindow}
                    style={({ pressed }) => [
                      styles.dockSideBtn,
                      {
                        backgroundColor: colors.surfaceMuted,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                  </Pressable>
                )}

                {/* CONTEXTUAL CENTER AREA */}
                <View style={styles.dockCenter}>
                  {expandedWindow?.type === "comments" ? (
                    <TextInput
                      value={commentDraft}
                      onChangeText={setCommentDraft}
                      placeholder="Comment as Chisomo..."
                      placeholderTextColor={colors.muted}
                      returnKeyType="send"
                      onSubmitEditing={handleSendComment}
                      style={[
                        styles.dockExpandedInput,
                        {
                          color: colors.text,
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.line,
                        },
                      ]}
                    />
                  ) : expandedWindow?.type === "message" ? (
                    <TextInput
                      value={messageDraft}
                      onChangeText={setMessageDraft}
                      placeholder={`Message ${expandedWindow.recipient.name}...`}
                      placeholderTextColor={colors.muted}
                      returnKeyType="send"
                      onSubmitEditing={handleSendMessage}
                      style={[
                        styles.dockExpandedInput,
                        {
                          color: colors.text,
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.line,
                        },
                      ]}
                    />
                  ) : expandedWindow?.type === "details" ? (
                    <View
                      style={[
                        styles.dockCapsule,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.line,
                        },
                      ]}
                    >
                      <Ionicons name="location" size={13} color={colors.signal} />
                      <Text numberOfLines={1} style={[styles.dockCapsuleText, { color: colors.text }]}>
                        {expandedWindow.post.place} · {expandedWindow.post.distanceKm} km
                      </Text>
                    </View>
                  ) : expandedWindow?.type === "profile_saved" ? (
                    <View
                      style={[
                        styles.dockCapsule,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.line,
                        },
                      ]}
                    >
                      <Ionicons name="bookmark" size={13} color={colors.signal} />
                      <Text numberOfLines={1} style={[styles.dockCapsuleText, { color: colors.text }]}>
                        {savedPosts.length} Places Saved
                      </Text>
                    </View>
                  ) : expandedWindow?.type === "profile_settings" ? (
                    <View
                      style={[
                        styles.dockCapsule,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.line,
                        },
                      ]}
                    >
                      <Ionicons name="options" size={13} color={colors.signal} />
                      <Text numberOfLines={1} style={[styles.dockCapsuleText, { color: colors.text }]}>
                        Lilongwe Preferences
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.dockCapsule,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.line,
                        },
                      ]}
                    >
                      <Ionicons name="sparkles" size={13} color={colors.signal} />
                      <Text numberOfLines={1} style={[styles.dockCapsuleText, { color: colors.text }]}>
                        Olive Lilongwe
                      </Text>
                    </View>
                  )}
                </View>

                {/* CONTEXTUAL RIGHT BUTTON */}
                {expandedWindow?.type === "comments" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Send comment"
                    onPress={handleSendComment}
                    style={({ pressed }) => [
                      styles.dockSideBtn,
                      {
                        backgroundColor: commentDraft.trim() ? colors.signal : colors.surfaceMuted,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={commentDraft.trim() ? colors.signalForeground : colors.muted}
                    />
                  </Pressable>
                ) : expandedWindow?.type === "message" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                    onPress={handleSendMessage}
                    style={({ pressed }) => [
                      styles.dockSideBtn,
                      {
                        backgroundColor: messageDraft.trim() ? colors.signal : colors.surfaceMuted,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color={messageDraft.trim() ? colors.signalForeground : colors.muted}
                    />
                  </Pressable>
                ) : expandedWindow?.type === "details" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Guide me there"
                    onPress={() => {
                      const p = expandedWindow.post;
                      closeExpandedWindow();
                      startGuidance(p);
                    }}
                    style={({ pressed }) => [
                      styles.dockSideBtn,
                      {
                        backgroundColor: colors.signal,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="navigate" size={20} color={colors.signalForeground} />
                  </Pressable>
                ) : expandedWindow?.type === "profile_saved" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Share saved places"
                    onPress={() => {
                      Share.share({
                        message: `Check out my saved spots in Lilongwe on Olive: ${savedPosts.map((p) => p.author).join(", ")}`,
                      });
                    }}
                    style={({ pressed }) => [
                      styles.dockSideBtn,
                      {
                        backgroundColor: colors.signal,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="share-social" size={20} color={colors.signalForeground} />
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Done"
                    onPress={() => {
                      closeExpandedWindow();
                      showToast("Updated!");
                    }}
                    style={({ pressed }) => [
                      styles.dockSideBtn,
                      {
                        backgroundColor: colors.signal,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="checkmark" size={20} color={colors.signalForeground} />
                  </Pressable>
                )}
              </Animated.View>
            ) : (
              /* Normal Resting Dock Bar */
              <Animated.View
                style={[
                  styles.dockBar,
                  {
                    backgroundColor: colors.text,
                    shadowColor: colors.text,
                    opacity: restingBarOpacity,
                  },
                ]}
              >
                {/* Left Button: Back on profile, Feed mode cycle on feed */}
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
                          : colors.bg,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  {panelOpen || searchOpen ? (
                    <Ionicons name="close" size={20} color={colors.signalForeground} />
                  ) : onProfile ? (
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                  ) : feedMode === "people" ? (
                    <Ionicons name="people" size={20} color={colors.signal} />
                  ) : feedMode === "places" ? (
                    <Ionicons name="business" size={20} color={colors.signal} />
                  ) : (
                    <Ionicons name="layers" size={20} color={colors.text} />
                  )}
                </Pressable>

                {/* Center Area: Sweeping line, audio waveform, or input */}
                <View style={styles.dockCenter}>
                  {activeMode === "type" ? (
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
                          setTimeout(() => setIsSearching(false), 1800);
                        }
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[styles.dockInput, { color: colors.bg }]}
                    />
                  ) : showAnimatingLine ? (
                    <View
                      style={styles.lineArea}
                      onLayout={(e: LayoutChangeEvent) => {
                        const w = e.nativeEvent.layout.width;
                        if (w > 0 && Math.abs(w - trackWidth) > 1) {
                          setTrackWidth(w);
                        }
                      }}
                    >
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
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setActiveMode("type")}
                      style={[styles.dockRestingCenter, { display: "none" }]}
                    >
                      <View style={styles.dockRestingPill}>
                        <Ionicons
                          name={
                            feedMode === "people"
                              ? "people-outline"
                              : feedMode === "places"
                              ? "business-outline"
                              : "sparkles-outline"
                          }
                          size={13}
                          color={colors.signal}
                        />
                        <Text numberOfLines={1} style={[styles.dockRestingText, { color: colors.bg }]}>
                          {onProfile
                            ? currentProfile.name
                            : feedMode === "people"
                            ? "People · Lilongwe"
                            : feedMode === "places"
                            ? "Places & Events"
                            : "Search Lilongwe..."}
                        </Text>
                      </View>
                    </Pressable>
                  )}
                </View>

                {/* Right Action Button: Sync toggle on feed, profile options on profile */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    onProfile
                      ? profileMenuOpen
                        ? "Close profile options"
                        : "Open profile options"
                      : panelOpen
                      ? "Submit"
                      : onFeed
                      ? isScanning
                        ? "Realtime feed sync is active. Tap to pause, hold for search options."
                        : "Realtime feed sync is paused. Tap to enable, hold for search options."
                      : "Search options"
                  }
                  onPress={handleRightPress}
                  onLongPress={handleRightLongPress}
                  delayLongPress={320}
                  style={({ pressed }) => [
                    styles.dockSideBtn,
                    {
                      backgroundColor: onProfile
                        ? profileMenuOpen
                          ? colors.signal
                          : colors.bg
                        : panelOpen || searchOpen
                        ? colors.signal
                        : onFeed && isScanning
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
                      color={profileMenuOpen ? colors.signalForeground : colors.text}
                    />
                  ) : panelOpen ? (
                    activeMode === "voice" ? (
                      <Ionicons
                        name={isListening ? "mic" : "mic-outline"}
                        size={20}
                        color={colors.signalForeground}
                      />
                    ) : activeMode === "type" ? (
                      <Ionicons name="arrow-forward" size={20} color={colors.signalForeground} />
                    ) : (
                      <Ionicons name="close" size={20} color={colors.signalForeground} />
                    )
                  ) : onFeed ? (
                    <Ionicons
                      name={isScanning ? "radio" : "radio-outline"}
                      size={20}
                      color={isScanning ? colors.signalForeground : colors.text}
                    />
                  ) : (
                    <Ionicons name="search" size={20} color={colors.signal} />
                  )}
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>
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
  dockCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 32,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 12,
    justifyContent: "space-between",
  },
  dockBar: {
    width: "100%",
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  expandedBottomDockBar: {
    height: 64,
  },
  dockSideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dockAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  dockAvatarPhoto: {
    width: "100%",
    height: "100%",
  },
  dockCenter: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  dockExpandedInput: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  dockCapsule: {
    height: 38,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  dockCapsuleText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  dockInput: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#FF6326",
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
  lineArea: {
    width: "100%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  baselineTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  sweepBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    height: "100%",
    borderRadius: 2,
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

  /* Expanded Floating Nav Layout */
  expandedContentWrap: {
    flex: 1,
    overflow: "hidden",
  },
  expandedTopHandleWrap: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  expandedTopHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  expandedCloseBtn: {
    position: "absolute",
    right: 14,
    top: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedSectionContainer: {
    flex: 1,
  },
  expandedSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 8,
    gap: 8,
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  expandedSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  headerShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  headerShareText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expandedScroll: {
    flex: 1,
  },
  expandedScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  /* Reviews & Comments Card */
  reviewItemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  reviewItemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImgSmall: {
    width: "100%",
    height: "100%",
  },
  reviewAvatarLetter: {
    fontSize: 13,
    fontWeight: "700",
  },
  reviewAuthorName: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  reviewStarsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 1,
  },
  reviewItemText: {
    fontSize: 13,
    lineHeight: 18,
  },

  /* Details View */
  detailsBodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 10,
  },
  detailsGrid: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  detailsGridRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailsGridLabel: {
    fontSize: 12,
    width: 60,
  },
  detailsGridVal: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  expandedPrimaryBtn: {
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  expandedPrimaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },

  /* Related View */
  relatedItemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 12,
  },
  relatedItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  relatedItemTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  relatedItemSubtitle: {
    fontSize: 11.5,
  },
  relatedItemDist: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* Saved Places View */
  savedItemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  savedItemPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  savedItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  savedItemTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  savedItemSub: {
    fontSize: 11.5,
  },
  savedItemTrashBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Settings View */
  settingsSection: {
    gap: 6,
    marginBottom: 6,
  },
  settingsSectionTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  settingsSectionHint: {
    fontSize: 11.5,
    marginBottom: 4,
  },
  settingsPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  settingPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  settingToggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  settingToggleTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  settingToggleSub: {
    fontSize: 11,
    marginTop: 1,
  },
  resetSettingsBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  resetSettingsText: {
    fontSize: 12,
    textDecorationLine: "underline",
  },

  /* Message View */
  messageRecipientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageHintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  messageHintText: {
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },

  /* Mode / Search Cards */
  modeCardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  modeCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  modeCardLabel: {
    fontSize: 14,
  },
  modeCardDesc: {
    fontSize: 11.5,
    marginTop: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  reportRowText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  /* Floating Toast */
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
});

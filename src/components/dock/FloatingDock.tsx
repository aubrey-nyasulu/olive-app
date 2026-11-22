import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  PanResponder,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  Bell,
  Bookmark,
  Flag,
  Link,
  MessageSquareMore,
  Settings,
  Share2,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useOlive,
  type ExpandedWindow,
  type FeedMode,
} from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { POSTS, getPostById } from "../../places";
import type { UserProfile } from "../../profiles";
import { DockActionBar } from "./DockActionBar";
import { CommentsView } from "./views/CommentsView";
import { DetailsView } from "./views/DetailsView";
import { RelatedView } from "./views/RelatedView";
import { SavedView } from "./views/SavedView";
import { SettingsView } from "./views/SettingsView";
import { MessageView } from "./views/MessageView";
import { ReportView } from "./views/ReportView";
import { FeedModesView } from "./views/FeedModesView";
import { SearchOptionsView } from "./views/SearchOptionsView";
import { UserMenuView } from "./views/UserMenuView";
import { NotificationsView } from "./views/NotificationsView";

interface DockOption {
  icon: LucideIcon;
  label: string;
  id:
    | "settings"
    | "saved"
    | "share"
    | "message"
    | "alerts"
    | "share_user"
    | "copy"
    | "report";
}

const PROFILE_OPTIONS: DockOption[] = [
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: Bookmark, label: "Saved", id: "saved" },
  { icon: Share2, label: "Share", id: "share" },
];

const OTHER_USER_OPTIONS: DockOption[] = [
  {
    icon: MessageSquareMore,
    label: "Message",
    id: "message",
  },
  { icon: Bell, label: "Alerts", id: "alerts" },
  { icon: Share2, label: "Share", id: "share_user" },
  { icon: Link, label: "Copy Link", id: "copy" },
  { icon: Flag, label: "Report", id: "report" },
];

interface FloatingDockProps {
  currentProfile: UserProfile;
  isOtherUser: boolean;
  profileMenuOpen: boolean;
  setProfileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  showToast: (msg: string) => void;
}

export function FloatingDock({
  currentProfile,
  isOtherUser,
  profileMenuOpen,
  setProfileMenuOpen,
  showToast,
}: FloatingDockProps) {
  const { styles, colors, isDark } = useThemeStyles(createStyles);
  const {
    savedIds,
    toggleSave,
    feedMode,
    setFeedMode,
    searchOpen,
    setSearchOpen,
    activeMode,
    setActiveMode,
    isListening,
    setIsListening,
    closeSearch,
    isSearching,
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
  const pathname = usePathname();
  const onFeed = pathname === "/";
  const onProfile = pathname === "/profile";
  const panelOpen = activeMode !== null;
  const isExpanded = expandedWindow !== null;

  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [alertsMap, setAlertsMap] = useState<Record<string, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;
  const dockExpandedAnim = useRef(new Animated.Value(0)).current;
  const normalDockBottom = Math.max(20, insets.bottom + 8);

  // Initial load timer (shows animating line on app launch)
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  const showAnimatingLine = isInitialLoading || isSearching || isScanning;

  // Listen for screen dimensions
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
      const shift = Math.max(0, kh + 28 - normalDockBottom);
      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: shift,
        duration,
        useNativeDriver: true,
      }).start();
    };

    const handleHide = (e: KeyboardEvent) => {
      setKeyboardHeight(0);
      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration,
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
    return () => subs.forEach((s) => s.remove());
  }, [keyboardShiftAnim, normalDockBottom]);

  const [renderedWindow, setRenderedWindow] =
    useState<ExpandedWindow>(expandedWindow);

  // Height bounds
  const isDetailsWindow =
    (renderedWindow ?? expandedWindow)?.type === "details";
  const expandedMaxHeight = Math.min(
    keyboardHeight > 0
      ? screenHeight - keyboardHeight - insets.top - 40
      : screenHeight * (isDetailsWindow ? 0.78 : 0.72),
    isDetailsWindow ? 580 : 520
  );
  const maxDockHeight = Math.max(280, expandedMaxHeight);
  const maxCollapseDelta = maxDockHeight - 64;

  const maxCollapseDeltaRef = useRef(maxCollapseDelta);
  maxCollapseDeltaRef.current = maxCollapseDelta;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 2;
      },
      onPanResponderMove: (_, gestureState) => {
        const collapseDelta = maxCollapseDeltaRef.current;
        const dy = Math.max(0, gestureState.dy);
        const progress = Math.max(0, Math.min(1, 1 - dy / collapseDelta));
        dockExpandedAnim.setValue(progress);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 65 || gestureState.vy > 0.45) {
          closeExpandedWindow();
        } else {
          Animated.spring(dockExpandedAnim, {
            toValue: 1,
            friction: 9,
            tension: 70,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: (_, gestureState) => {
        if (gestureState.dy > 65 || gestureState.vy > 0.45) {
          closeExpandedWindow();
        } else {
          Animated.spring(dockExpandedAnim, {
            toValue: 1,
            friction: 9,
            tension: 70,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Spring animation when expanded & keep content mounted until collapse finishes
  useEffect(() => {
    if (isExpanded) {
      setRenderedWindow(expandedWindow);
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
      }).start(({ finished }) => {
        if (finished) {
          setRenderedWindow(null);
        }
      });
    }
  }, [isExpanded, expandedWindow, dockExpandedAnim]);

  const dockHeight = dockExpandedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [64, maxDockHeight],
    extrapolate: "clamp",
  });

  const dockBg = dockExpandedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text, colors.surface],
    extrapolate: "clamp",
  });

  const dockBorderColor = dockExpandedAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: ["rgba(0,0,0,0)", colors.line, colors.line],
    extrapolate: "clamp",
  });

  const contentOpacity = dockExpandedAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const contentTranslateY = dockExpandedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
    extrapolate: "clamp",
  });

  const handleOpacity = dockExpandedAnim.interpolate({
    inputRange: [0, 0.35, 0.8],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const glassOpacity = dockExpandedAnim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 0.85, 1],
    extrapolate: "clamp",
  });

  const savedPosts = useMemo(
    () => POSTS.filter((p) => savedIds.includes(p.id)),
    [savedIds]
  );

  // Actions
  const handleSendComment = () => {
    if (commentDraft.trim() && expandedWindow?.type === "comments") {
      addReview(expandedWindow.post.id, {
        by: "Chisomo Banda",
        stars: 5,
        text: commentDraft.trim(),
      });
      setCommentDraft("");
      Keyboard.dismiss();
      showToast(`Review added for ${expandedWindow.post.author}`);
    }
  };

  const handleSendMessage = () => {
    if (messageDraft.trim() && expandedWindow?.type === "message") {
      const name = expandedWindow.recipient.name;
      setMessageDraft("");
      closeExpandedWindow();
      Keyboard.dismiss();
      showToast(`Message sent to ${name}`);
    }
  };

  const handleToggleSync = () => {
    const next = !isScanning;
    setIsScanning(next);
    showToast(next ? "Live stream active" : "Live stream paused");
  };

  const handleLeftPill = () => {
    Keyboard.dismiss();
    if (profileMenuOpen) {
      setProfileMenuOpen(false);
      return;
    }
    if (panelOpen || searchOpen) {
      closeSearch();
      return;
    }
    if (expandedWindow?.type === "search_options") {
      closeExpandedWindow();
      return;
    }
    if (isExpanded) {
      openExpandedWindow({ type: "search_options" });
      return;
    }
    if (onProfile) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate("/");
      }
      return;
    }
    // On feed: left button shows search icon; clicking it shows search options
    openExpandedWindow({ type: "search_options" });
  };

  const handleRightPress = () => {
    Keyboard.dismiss();
    if (onProfile && isOtherUser) {
      setProfileMenuOpen((prev) => !prev);
      return;
    }
    if (panelOpen) {
      closeSearch();
      return;
    }
    // Right button shows profile image; clicking it expands dock to show user options
    if (expandedWindow?.type === "user_menu") {
      closeExpandedWindow();
      return;
    }
    if (isExpanded) {
      openExpandedWindow({ type: "user_menu" });
      return;
    }
    openExpandedWindow({ type: "user_menu" });
  };

  return (
    <Animated.View
      style={[
        styles.dockWrap,
        {
          bottom: normalDockBottom,
          transform: [
            {
              translateY: Animated.multiply(keyboardShiftAnim, -1),
            },
          ],
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Vertical Profile Options Popup */}
      {profileMenuOpen && onProfile && (
        <View style={styles.modesPopup}>
          {(isOtherUser ? OTHER_USER_OPTIONS : PROFILE_OPTIONS).map(
            (item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => {
                  setProfileMenuOpen(false);
                  if (item.id === "settings") {
                    openExpandedWindow({ type: "profile_settings" });
                  } else if (item.id === "saved") {
                    openExpandedWindow({ type: "profile_saved" });
                  } else if (item.id === "share") {
                    Share.share({
                      message: "Olive — Discover local places and events",
                    });
                  } else if (item.id === "message") {
                    setMessageDraft("");
                    openExpandedWindow({
                      type: "message",
                      recipient: currentProfile,
                    });
                  } else if (item.id === "alerts") {
                    const isAlerted = !alertsMap[currentProfile.id];
                    setAlertsMap((prev) => ({
                      ...prev,
                      [currentProfile.id]: isAlerted,
                    }));
                    showToast(
                      isAlerted
                        ? `Alerts turned on for ${currentProfile.name}`
                        : `Alerts muted for ${currentProfile.name}`
                    );
                  } else if (item.id === "share_user") {
                    Share.share({
                      message: `Check out ${currentProfile.name} (${currentProfile.handle}) on Olive!`,
                    });
                  } else if (item.id === "copy") {
                    showToast(
                      `Profile link copied: olive.app/${currentProfile.handle.replace(
                        "@",
                        ""
                      )}`
                    );
                  } else if (item.id === "report") {
                    openExpandedWindow({
                      type: "report",
                      targetUser: currentProfile,
                    });
                  }
                }}
                style={({ pressed }) => [
                  styles.modeOptionRow,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.modeLabel}>{item.label}</Text>
                <View style={styles.modeCircle}>
                  {(() => {
                    const ItemIcon = item.icon;
                    return <ItemIcon size={18} color={colors.bg} />;
                  })()}
                </View>
              </Pressable>
            )
          )}
        </View>
      )}

      <Animated.View
        style={[
          styles.dockCard,
          {
            height: dockHeight,
            backgroundColor: dockBg,
            borderColor: dockBorderColor,
          },
        ]}
      >
        {/* Expanded Window View */}
        {renderedWindow !== null && (
          <Animated.View
            style={[
              styles.expandedWrap,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            {/* Top Drag Handle (Functional Drag down to close) */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.handleRow, { opacity: handleOpacity }]}
              accessibilityRole="adjustable"
              accessibilityLabel="Drag down to close menu"
            >
              <View style={styles.handleBar} />
            </Animated.View>

            {/* Content view based on active window */}
            {renderedWindow.type === "comments" && (
              <CommentsView
                post={renderedWindow.post}
                reviews={reviewsMap[renderedWindow.post.id] ?? []}
              />
            )}

            {renderedWindow.type === "details" && (
              <DetailsView
                post={renderedWindow.post}
                onNavigate={() => {
                  const p = renderedWindow.post;
                  closeExpandedWindow();
                  startGuidance(p);
                }}
                onSelectPlace={(other) => {
                  openExpandedWindow({ type: "details", post: other });
                }}
                onOpenProfile={() => {
                  const p = renderedWindow.post;
                  closeExpandedWindow();
                  setTimeout(() => {
                    router.push({
                      pathname: "/profile",
                      params: { author: p.author, id: p.id },
                    });
                  }, 280);
                }}
                onOpenReviews={() => {
                  openExpandedWindow({
                    type: "comments",
                    post: renderedWindow.post,
                  });
                }}
                showToast={showToast}
              />
            )}

            {renderedWindow.type === "related" && (
              <RelatedView
                post={renderedWindow.post}
                onSelectPlace={(id) => {
                  const p = getPostById(id);
                  if (p) {
                    openExpandedWindow({ type: "details", post: p });
                  }
                }}
              />
            )}

            {renderedWindow.type === "profile_saved" && (
              <SavedView
                savedPosts={savedPosts}
                onSelectPlace={(id) => {
                  const p = getPostById(id);
                  if (p) {
                    openExpandedWindow({ type: "details", post: p });
                  }
                }}
                onRemove={(id) => toggleSave(id)}
              />
            )}

            {renderedWindow.type === "profile_settings" && <SettingsView />}

            {renderedWindow.type === "message" && (
              <MessageView recipient={renderedWindow.recipient} />
            )}

            {renderedWindow.type === "report" && (
              <ReportView
                targetUser={renderedWindow.targetUser}
                onSubmitReport={() => {
                  closeExpandedWindow();
                  showToast("Report submitted. Thank you!");
                }}
              />
            )}

            {renderedWindow.type === "feed_modes" && (
              <FeedModesView
                onSelectMode={(mode) => {
                  setFeedMode(mode);
                  closeExpandedWindow();
                  showToast(
                    mode === "people"
                      ? "Feed: People only"
                      : mode === "places"
                      ? "Feed: Places & Events"
                      : "Feed: All activity"
                  );
                }}
              />
            )}

            {renderedWindow.type === "search_options" && (
              <SearchOptionsView
                onToggleSync={() => {
                  handleToggleSync();
                  closeExpandedWindow();
                }}
                onSelectSearchMode={(mode) => {
                  closeExpandedWindow();
                  setActiveMode(mode);
                  setIsListening(mode === "voice");
                }}
              />
            )}

            {renderedWindow.type === "user_menu" && (
              <UserMenuView
                onClose={closeExpandedWindow}
                showToast={showToast}
              />
            )}

            {renderedWindow.type === "notifications" && (
              <NotificationsView
                onClose={closeExpandedWindow}
                showToast={showToast}
              />
            )}
          </Animated.View>
        )}

        {/* Fixed Bottom Glassmorphism Action Bar Container */}
        <View style={styles.fixedBottomWrap} pointerEvents="box-none">
          {/* Glassmorphism Background Layer */}
          <Animated.View
            style={[styles.glassContainer, { opacity: glassOpacity }]}
            pointerEvents="none"
          >
            {/* Frosted Glass Pane with BlurView and Tint */}
            <View style={styles.glassFrostedPane}>
              <BlurView
                intensity={Platform.OS === "ios" ? 120 : 200}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  styles.glassTintOverlay,
                  isDark ? styles.glassTintDark : styles.glassTintLight,
                ]}
              />
            </View>

            {/* Subtle Frosted Top Hairline */}
            <View style={styles.glassTopBorder} />
          </Animated.View>

          {/* Action Bar (Contextual when expanded, standard when collapsed) */}
          <DockActionBar
            expandProgress={dockExpandedAnim}
            renderedWindow={renderedWindow}
            isExpanded={isExpanded}
            expandedWindow={expandedWindow}
            showAnimatingLine={showAnimatingLine}
            onFeed={onFeed}
            onProfile={onProfile}
            panelOpen={panelOpen}
            searchOpen={searchOpen}
            profileMenuOpen={profileMenuOpen}
            isListening={isListening}
            isOtherUser={isOtherUser}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
            messageDraft={messageDraft}
            setMessageDraft={setMessageDraft}
            savedCount={savedPosts.length}
            onSendComment={handleSendComment}
            onSendMessage={handleSendMessage}
            onCloseExpanded={closeExpandedWindow}
            onToggleSearch={handleRightPress}
            onRightLongPress={() => {
              if (onFeed && !panelOpen) {
                openExpandedWindow({ type: "search_options" });
              }
            }}
            onLeftPill={handleLeftPill}
            onLeftLongPress={() => {
              if (onFeed && !panelOpen && !searchOpen) {
                openExpandedWindow({ type: "feed_modes" });
              }
            }}
            onToggleListening={() => setIsListening((l) => !l)}
            onDoneExpanded={() => {
              closeExpandedWindow();
              showToast("Saved");
            }}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    dockWrap: {
      position: "absolute",
      left: 16,
      right: 16,
      alignItems: "center",
      zIndex: 50,
    },
    dockCard: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 32,
      borderWidth: 1,
      shadowColor: colors.overlay,
      overflow: "hidden",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.32,
      shadowRadius: 24,
      elevation: 12,
      justifyContent: "flex-end",
    },
    expandedWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
    },
    fixedBottomWrap: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      zIndex: 20,
      justifyContent: "flex-end",
    },
    glassContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 88,
      overflow: "hidden",
    },
    glassFrostedPane: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      overflow: "hidden",
    },
    glassTintOverlay: {
      ...(Platform.OS === "web"
        ? ({
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          } as any)
        : {}),
    },
    glassTintLight: {
      backgroundColor: "rgba(255, 255, 255, 0.72)",
    },
    glassTintDark: {
      backgroundColor: "rgba(20, 19, 18, 0.76)",
    },
    glassTopBorder: {
      position: "absolute",
      top: 24,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.line,
      opacity: 0.5,
    },
    handleRow: {
      height: 32,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 8,
      paddingBottom: 8,
    },
    handleBar: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
    },
    modesPopup: {
      marginBottom: 16,
      alignItems: "flex-end",
      gap: 12,
      alignSelf: "flex-end",
      paddingRight: 8,
    },
    modeOptionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    modeLabel: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.2,
      color: colors.text,
    },
    modeCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.text,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 5,
    },
  });

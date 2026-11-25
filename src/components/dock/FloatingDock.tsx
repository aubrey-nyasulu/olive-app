import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  PanResponder,
  type PanResponderGestureState,
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
  Flag,
  Link,
  MessageSquareMore,
  Share2,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive, type ExpandedWindow } from "../../context/OliveProvider";
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
import { SearchOptionsView } from "./views/SearchOptionsView";
import { UserMenuView } from "./views/UserMenuView";
import { NotificationsView } from "./views/NotificationsView";

interface OtherUserOption {
  icon: LucideIcon;
  label: string;
  id: "message" | "alerts" | "share_user" | "copy" | "report";
}

const OTHER_USER_OPTIONS: OtherUserOption[] = [
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
    activeMode,
    setActiveMode,
    isListening,
    setIsListening,
    typeQuery,
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
  const pathname = usePathname();
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
    (() => {
      const handleGestureEnd = (gestureState: PanResponderGestureState) => {
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
      };

      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 2,
        onPanResponderMove: (_, gestureState) => {
          const collapseDelta = maxCollapseDeltaRef.current;
          const dy = Math.max(0, gestureState.dy);
          const progress = Math.max(0, Math.min(1, 1 - dy / collapseDelta));
          dockExpandedAnim.setValue(progress);
        },
        onPanResponderRelease: (_, gestureState) =>
          handleGestureEnd(gestureState),
        onPanResponderTerminate: (_, gestureState) =>
          handleGestureEnd(gestureState),
      });
    })()
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

  // Left button: Cancel search (when panelOpen), Back (Profile), or Profile avatar -> User Menu (Feed)
  const handleLeftPress = () => {
    Keyboard.dismiss();
    if (profileMenuOpen) {
      setProfileMenuOpen(false);
      return;
    }
    if (panelOpen) {
      closeSearch();
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
    if (expandedWindow?.type === "user_menu") {
      closeExpandedWindow();
      return;
    }
    openExpandedWindow({ type: "user_menu" });
  };

  // Right button: Search action (when panelOpen), Other User menu / Profile avatar (Profile), or Search options (Feed)
  const handleRightPress = () => {
    Keyboard.dismiss();
    if (panelOpen) {
      if (activeMode === "voice") {
        setIsListening((l) => !l);
      } else if (activeMode === "type") {
        if (typeQuery.trim()) {
          setIsSearching(true);
          setTimeout(() => setIsSearching(false), 1800);
        }
      } else {
        closeSearch();
      }
      return;
    }
    if (onProfile && isOtherUser) {
      setProfileMenuOpen((prev) => !prev);
      return;
    }
    if (onProfile) {
      if (expandedWindow?.type === "user_menu") {
        closeExpandedWindow();
        return;
      }
      openExpandedWindow({ type: "user_menu" });
      return;
    }
    if (expandedWindow?.type === "search_options") {
      closeExpandedWindow();
      return;
    }
    openExpandedWindow({ type: "search_options" });
  };

  const handleOtherUserOption = (optionId: OtherUserOption["id"]) => {
    setProfileMenuOpen(false);
    if (optionId === "message") {
      setMessageDraft("");
      openExpandedWindow({
        type: "message",
        recipient: currentProfile,
      });
    } else if (optionId === "alerts") {
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
    } else if (optionId === "share_user") {
      Share.share({
        message: `Check out ${currentProfile.name} (${currentProfile.handle}) on Olive!`,
      });
    } else if (optionId === "copy") {
      showToast(
        `Profile link copied: olive.app/${currentProfile.handle.replace(
          "@",
          ""
        )}`
      );
    } else if (optionId === "report") {
      openExpandedWindow({
        type: "report",
        targetUser: currentProfile,
      });
    }
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
      {/* Vertical Other-User Profile Options Popup (anchored above Right button) */}
      {profileMenuOpen && onProfile && isOtherUser && (
        <View style={styles.modesPopup}>
          {OTHER_USER_OPTIONS.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => handleOtherUserOption(item.id)}
                style={({ pressed }) => [
                  styles.modeOptionRow,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.modeLabel}>{item.label}</Text>
                <View style={styles.modeCircle}>
                  <ItemIcon size={18} color={colors.bg} />
                </View>
              </Pressable>
            );
          })}
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
            {/* Top Drag Handle (Drag down to close) */}
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
            onProfile={onProfile}
            panelOpen={panelOpen}
            profileMenuOpen={profileMenuOpen}
            isListening={isListening}
            isOtherUser={isOtherUser}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
            messageDraft={messageDraft}
            setMessageDraft={setMessageDraft}
            onSendComment={handleSendComment}
            onSendMessage={handleSendMessage}
            onCloseExpanded={closeExpandedWindow}
            onLeftPress={handleLeftPress}
            onRightPress={handleRightPress}
            onToggleListening={() => setIsListening((l) => !l)}
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

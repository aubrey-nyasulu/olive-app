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
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive, type ExpandedWindow } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { POSTS, getPostById } from "../../places";
import type { UserProfile } from "../../profiles";
import { DockActionBar } from "./DockActionBar";
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
  const { styles, colors } = useThemeStyles(createStyles);
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
    openPopup,
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
  const expandedMaxHeight = Math.min(
    keyboardHeight > 0
      ? screenHeight - keyboardHeight - insets.top - 40
      : screenHeight * 0.72,
    520
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

  const drawerHeight = dockExpandedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [64, maxDockHeight],
    extrapolate: "clamp",
  });

  const drawerOpacity = dockExpandedAnim.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 1, 1],
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

  const savedPosts = useMemo(
    () => POSTS.filter((p) => savedIds.includes(p.id)),
    [savedIds]
  );

  // Actions
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

      {/* 1. Drawer Container (Expands from behind the floating dock) */}
      {renderedWindow !== null && (
        <Animated.View
          style={[
            styles.drawerCard,
            {
              height: drawerHeight,
              opacity: drawerOpacity,
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

          {/* Expanded Drawer Content View */}
          <Animated.View
            style={[
              styles.drawerContentWrap,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            {renderedWindow.type === "profile_saved" && (
              <SavedView
                savedPosts={savedPosts}
                onSelectPlace={(id) => {
                  const p = getPostById(id);
                  if (p) {
                    closeExpandedWindow();
                    openPopup(
                      { type: "details", post: p },
                      {
                        triggerId: `saved-${p.id}`,
                        rect: {
                          x: 16,
                          y: 120,
                          width: 360,
                          height: 240,
                        },
                        style: {
                          borderRadius: 24,
                          backgroundColor: colors.surface,
                          borderColor: colors.line,
                          borderWidth: 1,
                        },
                        headerMorph: {
                          headerTitle: p.place,
                          headerSubtitle: `${p.author} · ${p.category} · ${p.distanceKm} km`,
                        },
                      }
                    );
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
        </Animated.View>
      )}

      {/* 2. Floating Dock Pill (Remains intact at the bottom, resting in front of the drawer) */}
      <View style={styles.floatingDockPill}>
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
          onCloseExpanded={closeExpandedWindow}
          onLeftPress={handleLeftPress}
          onRightPress={handleRightPress}
          onToggleListening={() => setIsListening((l) => !l)}
        />
      </View>
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
    drawerCard: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      maxWidth: 420,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 8,
      overflow: "hidden",
      zIndex: 10,
    },
    drawerContentWrap: {
      flex: 1,
      overflow: "hidden",
    },
    floatingDockPill: {
      width: "100%",
      maxWidth: 420,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.text,
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.32,
      shadowRadius: 24,
      elevation: 16,
      overflow: "hidden",
      justifyContent: "center",
      zIndex: 20,
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

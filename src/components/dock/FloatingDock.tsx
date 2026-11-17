import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive, type FeedMode } from "../../context/OliveProvider";
import { POSTS } from "../../places";
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
  const {
    colors,
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

  // Spring animation when expanded
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

  // Height interpolations
  const expandedMaxHeight = Math.min(
    keyboardHeight > 0
      ? screenHeight - keyboardHeight - insets.top - 40
      : screenHeight * 0.72,
    520
  );

  const dockHeight = dockExpandedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [64, Math.max(280, expandedMaxHeight)],
  });

  const contentOpacity = dockExpandedAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
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
    } else if (onProfile) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate("/");
      }
    } else if (onFeed) {
      const nextMode: FeedMode =
        feedMode === "all"
          ? "people"
          : feedMode === "people"
          ? "places"
          : "all";
      setFeedMode(nextMode);
      if (nextMode === "people") {
        showToast("Feed: People only");
      } else if (nextMode === "places") {
        showToast("Feed: Places & Events");
      } else {
        showToast("Feed: All activity");
      }
    } else if (!onFeed) {
      router.navigate("/");
    }
  };

  const handleRightPress = () => {
    Keyboard.dismiss();
    if (onProfile) {
      setProfileMenuOpen((prev) => !prev);
      return;
    }
    if (panelOpen) {
      closeSearch();
    } else if (searchOpen) {
      setSearchOpen(false);
    } else if (onFeed) {
      handleToggleSync();
    }
  };

  return (
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
                      message: "Olive — Discover local places and events",
                    });
                  } else if (optId === "message") {
                    setMessageDraft("");
                    openExpandedWindow({
                      type: "message",
                      recipient: currentProfile,
                    });
                  } else if (optId === "alerts") {
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
                  } else if (optId === "share_user") {
                    Share.share({
                      message: `Check out ${currentProfile.name} (${currentProfile.handle}) on Olive!`,
                    });
                  } else if (optId === "copy") {
                    showToast(
                      `Profile link copied: olive.app/${currentProfile.handle.replace("@", "")}`
                    );
                  } else if (optId === "report") {
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
                <Text style={[styles.modeLabel, { color: colors.text }]}>
                  {label}
                </Text>
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
        {/* Expanded Window View */}
        {isExpanded && (
          <Animated.View
            style={[styles.expandedWrap, { opacity: contentOpacity }]}
          >
            {/* Top Drag Handle & Close */}
            <View style={styles.handleRow}>
              <View
                style={[
                  styles.handleBar,
                  { backgroundColor: colors.line },
                ]}
              />
              <Pressable
                accessibilityLabel="Close"
                onPress={closeExpandedWindow}
                style={[
                  styles.closeBtn,
                  { backgroundColor: colors.surfaceMuted },
                ]}
              >
                <Ionicons name="close" size={16} color={colors.text} />
              </Pressable>
            </View>

            {/* Content view based on active window */}
            {expandedWindow?.type === "comments" && (
              <CommentsView
                post={expandedWindow.post}
                reviews={
                  reviewsMap[expandedWindow.post.id] ?? []
                }
              />
            )}

            {expandedWindow?.type === "details" && (
              <DetailsView
                post={expandedWindow.post}
                onNavigate={() => {
                  const p = expandedWindow.post;
                  closeExpandedWindow();
                  startGuidance(p);
                }}
              />
            )}

            {expandedWindow?.type === "related" && (
              <RelatedView
                post={expandedWindow.post}
                onSelectPlace={(id) => {
                  closeExpandedWindow();
                  router.push(`/p/${id}`);
                }}
              />
            )}

            {expandedWindow?.type === "profile_saved" && (
              <SavedView
                savedPosts={savedPosts}
                onSelectPlace={(id) => {
                  closeExpandedWindow();
                  router.push(`/p/${id}`);
                }}
                onRemove={(id) => toggleSave(id)}
              />
            )}

            {expandedWindow?.type === "profile_settings" && <SettingsView />}

            {expandedWindow?.type === "message" && (
              <MessageView recipient={expandedWindow.recipient} />
            )}

            {expandedWindow?.type === "report" && (
              <ReportView
                targetUser={expandedWindow.targetUser}
                onSubmitReport={() => {
                  closeExpandedWindow();
                  showToast("Report submitted. Thank you!");
                }}
              />
            )}

            {expandedWindow?.type === "feed_modes" && (
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

            {expandedWindow?.type === "search_options" && (
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
          </Animated.View>
        )}

        {/* Action Bar (Contextual when expanded, standard when collapsed) */}
        <DockActionBar
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
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    overflow: "hidden",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 12,
    justifyContent: "space-between",
  },
  expandedWrap: {
    flex: 1,
    overflow: "hidden",
  },
  handleRow: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  closeBtn: {
    position: "absolute",
    right: 14,
    top: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    gap: 10,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  modeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
});

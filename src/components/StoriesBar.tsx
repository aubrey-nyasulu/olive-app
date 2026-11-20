import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeStyles, type ColorPalette } from "../theme";
import { STORIES, type StoryItem } from "../stories";
import { useOlive } from "../context/OliveProvider";
import { getPostById } from "../places";

export function StoriesBar() {
  const { styles, colors } = useThemeStyles(createStyles);
  const { openExpandedWindow } = useOlive();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [reactedStoryId, setReactedStoryId] = useState<string | null>(null);

  const activeStory =
    activeStoryIndex !== null ? STORIES[activeStoryIndex] : null;

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setReactedStoryId(null);
  };

  const handleClose = () => {
    setActiveStoryIndex(null);
    setReactedStoryId(null);
  };

  const handleNext = () => {
    if (activeStoryIndex !== null && activeStoryIndex < STORIES.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setReactedStoryId(null);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setReactedStoryId(null);
    }
  };

  const handleReaction = (emoji: string) => {
    if (!activeStory) return;
    setReactedStoryId(emoji);
    setTimeout(() => {
      setReactedStoryId(null);
    }, 1800);
  };

  const handleNavigateToPlace = () => {
    if (!activeStory) return;
    handleClose();
    if (activeStory.isOwner) {
      router.push("/profile");
    } else if (activeStory.targetPostId) {
      const targetPost = getPostById(activeStory.targetPostId);
      if (targetPost) {
        openExpandedWindow({ type: "details", post: targetPost });
      }
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STORIES.map((story, index) => {
          const isOwner = story.isOwner;
          const hasUnread = story.hasUnread;

          return (
            <Pressable
              key={story.id}
              accessibilityRole="button"
              accessibilityLabel={`${story.displayName}'s story`}
              onPress={() => handleOpenStory(index)}
              style={({ pressed }) => [
                styles.storyItem,
                pressed && styles.pressed,
              ]}
            >
              {/* Ring container */}
              <View style={styles.avatarWrapper}>
                {isOwner ? (
                  // Owner circle with Add '+' badge
                  <View style={styles.ownerRing}>
                    <View style={styles.innerRingSpacer}>
                      <Image source={story.avatar} style={styles.avatarImg} />
                    </View>
                    <View style={styles.addBadge}>
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                ) : hasUnread ? (
                  // Gradient ring indicator for unread updates
                  <LinearGradient
                    colors={[colors.signal, "#F59E0B", "#EF4444"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientRing}
                  >
                    <View style={styles.innerRingSpacer}>
                      <Image source={story.avatar} style={styles.avatarImg} />
                    </View>
                  </LinearGradient>
                ) : (
                  // Viewed/seen story ring
                  <View style={styles.seenRing}>
                    <View style={styles.innerRingSpacer}>
                      <Image source={story.avatar} style={styles.avatarImg} />
                    </View>
                  </View>
                )}

                {/* Optional status pill badge (e.g. LIVE / HOT / NEW) */}
                {story.badge && (
                  <View
                    style={[
                      styles.statusPillBadge,
                      story.badge === "LIVE"
                        ? styles.statusBadgeLive
                        : story.badge === "HOT"
                        ? styles.statusBadgeHot
                        : styles.statusBadgeNew,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{story.badge}</Text>
                  </View>
                )}
              </View>

              {/* Display name */}
              <Text
                numberOfLines={1}
                style={[
                  styles.storyLabel,
                  hasUnread
                    ? styles.storyLabelUnread
                    : styles.storyLabelDefault,
                ]}
              >
                {story.displayName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Fullscreen Story Viewer Modal */}
      {activeStory && (
        <Modal
          visible={activeStoryIndex !== null}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={handleClose} />

            <View style={styles.modalContainer}>
              {/* Top Progress Segments (Timer indicators) */}
              <View style={styles.progressRow}>
                {STORIES.map((s, idx) => (
                  <View key={s.id} style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        idx <= (activeStoryIndex ?? 0)
                          ? styles.progressBarActive
                          : styles.progressBarInactive,
                      ]}
                    />
                  </View>
                ))}
              </View>

              {/* Story Header */}
              <View style={styles.storyHeader}>
                <Pressable
                  onPress={handleNavigateToPlace}
                  style={styles.storyAuthorRow}
                >
                  <View style={styles.headerAvatarWrap}>
                    <Image
                      source={activeStory.avatar}
                      style={styles.headerAvatar}
                    />
                  </View>
                  <View style={styles.headerMeta}>
                    <View style={styles.authorTitleRow}>
                      <Text style={styles.headerAuthorName} numberOfLines={1}>
                        {activeStory.authorName}
                      </Text>
                      {activeStory.badge && (
                        <View
                          style={[
                            styles.headerBadgePill,
                            activeStory.badge === "LIVE"
                              ? styles.statusBadgeLive
                              : styles.statusBadgeHot,
                          ]}
                        >
                          <Text style={styles.headerBadgeText}>
                            {activeStory.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.locationTimeRow}>
                      <Ionicons
                        name="location-sharp"
                        size={11}
                        color={colors.signal}
                      />
                      <Text style={styles.headerLocationText}>
                        {activeStory.location} · {activeStory.timeAgo}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close story"
                  onPress={handleClose}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={18} color={colors.text} />
                </Pressable>
              </View>

              {/* Story Content Card with navigation tap areas */}
              <View style={styles.storyMediaCard}>
                <Image
                  source={activeStory.storyImage}
                  style={styles.storyImage}
                  resizeMode="cover"
                />

                {/* Left/Right Tap Zones for Story Navigation */}
                <Pressable style={styles.tapPrevZone} onPress={handlePrev} />
                <Pressable style={styles.tapNextZone} onPress={handleNext} />

                {/* Bottom Story Gradient Scrim & Caption */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.storyOverlayGradient}
                >
                  <View style={styles.storyCaptionBox}>
                    <Text style={styles.storyTitleText}>
                      {activeStory.title}
                    </Text>
                    <Text style={styles.storyCaptionText}>
                      {activeStory.caption}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Reaction Toast Feedback */}
              {reactedStoryId && (
                <View style={styles.reactionToast}>
                  <Text style={styles.reactionToastText}>
                    Sent {reactedStoryId} to {activeStory.displayName}
                  </Text>
                </View>
              )}

              {/* Bottom Quick-Action & Reaction Row */}
              <View style={styles.storyBottomBar}>
                {/* View Venue / Drop Button */}
                <Pressable
                  accessibilityRole="button"
                  onPress={handleNavigateToPlace}
                  style={({ pressed }) => [
                    styles.viewVenueBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="compass-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.viewVenueText}>
                    {activeStory.isOwner ? "View My Profile" : "View Venue"}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </Pressable>

                {/* Quick Reaction Emojis */}
                <View style={styles.reactionsGroup}>
                  {["❤️", "🔥", "👏", "😋"].map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => handleReaction(emoji)}
                      style={({ pressed }) => [
                        styles.reactionBtn,
                        pressed && styles.reactionBtnPressed,
                      ]}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    sectionContainer: {
      marginHorizontal: -16,
      marginBottom: 16,
      marginTop: 4,
    },
    scrollContent: {
      paddingHorizontal: 16,
      gap: 14,
    },
    storyItem: {
      alignItems: "center",
      width: "auto",
    },
    pressed: {
      opacity: 0.85,
    },
    avatarWrapper: {
      width: "auto",
      height: "auto",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    ownerRing: {
      width: "auto",
      height: "auto",
      borderRadius: 40,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    gradientRing: {
      width: "auto",
      height: "auto",
      borderRadius: 40,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    innerRingSpacer: {
      width: 80,
      height: 106,
      borderRadius: 32,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
    },
    seenRing: {
      width: "auto",
      height: "auto",
      borderRadius: 40,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    avatarImg: {
      width: "100%",
      height: "100%",
      borderRadius: 32,
      resizeMode: "cover",
    },
    addBadge: {
      position: "absolute",
      bottom: -8,
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.signal,
      borderColor: colors.surface,
    },
    statusPillBadge: {
      position: "absolute",
      bottom: -4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.surface,
    },
    statusBadgeLive: {
      backgroundColor: "#DC2626",
    },
    statusBadgeHot: {
      backgroundColor: colors.signal,
    },
    statusBadgeNew: {
      backgroundColor: "#10B981",
    },
    statusPillText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: 0.3,
    },
    storyLabel: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 6,
      width: 72,
      color: colors.text,
    },
    storyLabelDefault: {
      fontWeight: "500",
    },
    storyLabelUnread: {
      fontWeight: "700",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "flex-end",
      paddingHorizontal: 8,
      paddingBottom: 12,
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFill,
    },
    modalContainer: {
      width: "100%",
      height: "92%",
      borderRadius: 32,
      borderWidth: 2,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.3,
      shadowRadius: 18,
      elevation: 12,
      backgroundColor: colors.surface,
      borderColor: colors.signal,
    },
    progressRow: {
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    progressBarTrack: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 2,
    },
    progressBarActive: {
      backgroundColor: colors.signal,
      width: "100%",
    },
    progressBarInactive: {
      backgroundColor: "transparent",
      width: "0%",
    },
    storyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    storyAuthorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    headerAvatarWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.signal,
    },
    headerAvatar: {
      width: "100%",
      height: "100%",
      borderRadius: 20,
      resizeMode: "cover",
    },
    headerMeta: {
      flex: 1,
    },
    authorTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerAuthorName: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    headerBadgePill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    headerBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    locationTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    headerLocationText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.muted,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
      borderColor: colors.line,
    },
    storyMediaCard: {
      flex: 1,
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 24,
      overflow: "hidden",
      position: "relative",
      backgroundColor: "#111827",
    },
    storyImage: {
      width: "100%",
      height: "100%",
    },
    tapPrevZone: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "35%",
      zIndex: 5,
    },
    tapNextZone: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "65%",
      zIndex: 5,
    },
    storyOverlayGradient: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 48,
      paddingBottom: 20,
      zIndex: 10,
      pointerEvents: "none",
    },
    storyCaptionBox: {
      gap: 8,
    },
    storyTitleText: {
      fontSize: 18,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.2,
    },
    storyCaptionText: {
      fontSize: 14,
      lineHeight: 20,
      color: "rgba(255, 255, 255, 0.9)",
    },
    reactionToast: {
      position: "absolute",
      top: 60,
      alignSelf: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      zIndex: 20,
      elevation: 8,
      backgroundColor: colors.signal,
    },
    reactionToastText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },
    storyBottomBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      gap: 12,
    },
    viewVenueBtn: {
      flex: 1,
      height: 44,
      borderRadius: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.signal,
    },
    viewVenueText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    reactionsGroup: {
      flexDirection: "row",
      gap: 8,
    },
    reactionBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
      borderColor: colors.line,
    },
    reactionBtnPressed: {
      transform: [{ scale: 1.25 }],
    },
    reactionEmoji: {
      fontSize: 18,
    },
  });

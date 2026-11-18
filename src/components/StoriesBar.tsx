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
import { useOlive } from "../context/OliveProvider";
import { STORIES, type StoryItem } from "../stories";

export function StoriesBar() {
  const { colors } = useOlive();
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
      router.push(`/p/${activeStory.targetPostId}` as any);
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
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              {/* Ring container */}
              <View style={styles.avatarWrapper}>
                {isOwner ? (
                  // Owner circle with Add '+' badge
                  <View
                    style={[
                      styles.ownerRing,
                      {
                        borderColor: colors.line,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.innerRingSpacer,
                        { backgroundColor: colors.bg },
                      ]}
                    >
                      <Image source={story.avatar} style={styles.avatarImg} />
                    </View>
                    <View
                      style={[
                        styles.addBadge,
                        {
                          backgroundColor: colors.signal,
                          borderColor: colors.surface,
                        },
                      ]}
                    >
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
                    <View
                      style={[
                        styles.innerRingSpacer,
                        { backgroundColor: colors.bg },
                      ]}
                    >
                      <Image source={story.avatar} style={styles.avatarImg} />
                    </View>
                  </LinearGradient>
                ) : (
                  // Viewed/seen story ring
                  <View
                    style={[
                      styles.seenRing,
                      {
                        borderColor: colors.line,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.innerRingSpacer,
                        { backgroundColor: colors.bg },
                      ]}
                    >
                      <Image source={story.avatar} style={styles.avatarImg} />
                    </View>
                  </View>
                )}

                {/* Optional status pill badge (e.g. LIVE / HOT / NEW) */}
                {story.badge && (
                  <View
                    style={[
                      styles.statusPillBadge,
                      {
                        backgroundColor:
                          story.badge === "LIVE"
                            ? "#DC2626"
                            : story.badge === "HOT"
                            ? colors.signal
                            : "#10B981",
                        borderColor: colors.surface,
                      },
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
                  {
                    color: colors.text,
                    fontWeight: hasUnread ? "700" : "500",
                  },
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

            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.signal,
                },
              ]}
            >
              {/* Top Progress Segments (Timer indicators) */}
              <View style={styles.progressRow}>
                {STORIES.map((s, idx) => (
                  <View
                    key={s.id}
                    style={[
                      styles.progressBarTrack,
                      { backgroundColor: "rgba(255,255,255,0.25)" },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor:
                            idx <= (activeStoryIndex ?? 0)
                              ? colors.signal
                              : "transparent",
                          width: idx <= (activeStoryIndex ?? 0) ? "100%" : "0%",
                        },
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
                  <View
                    style={[
                      styles.headerAvatarWrap,
                      { borderColor: colors.signal },
                    ]}
                  >
                    <Image
                      source={activeStory.avatar}
                      style={styles.headerAvatar}
                    />
                  </View>
                  <View style={styles.headerMeta}>
                    <View style={styles.authorTitleRow}>
                      <Text
                        style={[
                          styles.headerAuthorName,
                          { color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {activeStory.authorName}
                      </Text>
                      {activeStory.badge && (
                        <View
                          style={[
                            styles.headerBadgePill,
                            {
                              backgroundColor:
                                activeStory.badge === "LIVE"
                                  ? "#DC2626"
                                  : colors.signal,
                            },
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
                      <Text
                        style={[
                          styles.headerLocationText,
                          { color: colors.muted },
                        ]}
                      >
                        {activeStory.location} · {activeStory.timeAgo}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close story"
                  onPress={handleClose}
                  style={[
                    styles.closeBtn,
                    {
                      backgroundColor: colors.bg,
                      borderColor: colors.line,
                    },
                  ]}
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
                <View
                  style={[
                    styles.reactionToast,
                    { backgroundColor: colors.signal },
                  ]}
                >
                  <Text style={styles.reactionToastText}>
                    Sent {reactedStoryId} to {activeStory.displayName}
                  </Text>
                </View>
              )}

              {/* Bottom Quick-Action & Reaction Row */}
              <View
                style={[styles.storyBottomBar, { borderTopColor: colors.line }]}
              >
                {/* View Venue / Drop Button */}
                <Pressable
                  accessibilityRole="button"
                  onPress={handleNavigateToPlace}
                  style={({ pressed }) => [
                    styles.viewVenueBtn,
                    {
                      backgroundColor: colors.signal,
                      opacity: pressed ? 0.88 : 1,
                    },
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
                        {
                          backgroundColor: colors.bg,
                          borderColor: colors.line,
                          transform: [{ scale: pressed ? 1.25 : 1 }],
                        },
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

const styles = StyleSheet.create({
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
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientRing: {
    width: "auto",
    height: "auto",
    borderRadius: 32,
    padding: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  innerRingSpacer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  seenRing: {
    width: "auto",
    height: "auto",
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 998,
    resizeMode: "cover",
  },
  addBadge: {
    position: "absolute",
    bottom: -8,
    width: 28,
    height: 28,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPillBadge: {
    position: "absolute",
    bottom: -5,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPillText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  storyLabel: {
    fontSize: 11.5,
    textAlign: "center",
    marginTop: 6,
    width: 72,
  },

  /* Story Viewer Modal - strictly adhering to 100% - 16px, 32px radius & 2px signal border */
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
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  progressBarTrack: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 1.5,
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
    gap: 10,
    flex: 1,
  },
  headerAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    padding: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    resizeMode: "cover",
  },
  headerMeta: {
    flex: 1,
  },
  authorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerAuthorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerBadgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  headerBadgeText: {
    fontSize: 9,
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
    fontSize: 11.5,
    fontWeight: "500",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  storyMediaCard: {
    flex: 1,
    marginHorizontal: 12,
    marginVertical: 6,
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
    gap: 6,
  },
  storyTitleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  storyCaptionText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: "rgba(255, 255, 255, 0.9)",
  },
  reactionToast: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 20,
    elevation: 8,
  },
  reactionToastText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  storyBottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  viewVenueBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
  },
  viewVenueText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  reactionsGroup: {
    flexDirection: "row",
    gap: 6,
  },
  reactionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reactionEmoji: {
    fontSize: 17,
  },
});

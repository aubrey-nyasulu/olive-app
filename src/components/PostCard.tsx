import { useState } from "react";
import { Image, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Post } from "../models";
import { relatedPosts, REVIEWS } from "../places";
import { useOlive } from "../context/OliveProvider";

// Fixed 1:1 square media aspect ratio
export const POST_MEDIA_ASPECT_RATIO = 1;

export function PostCard({
  post,
  hideAuthor = false,
}: {
  post: Post;
  hideAuthor?: boolean;
}) {
  const {
    colors,
    isSaved,
    toggleSave,
    startGuidance,
    closeSearch,
    openExpandedWindow,
    reviewsMap,
  } = useOlive();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    () => Math.floor(Math.abs(post.lat * 100) % 35) + 8
  );
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const reviews = reviewsMap[post.id] ?? REVIEWS[post.id] ?? [];
  const latestReview = reviews.length > 0 ? reviews[0] : null;
  const related = relatedPosts(post);
  const saved = isSaved(post.id);

  const openPlace = () => {
    closeSearch();
    router.push(`/p/${post.id}`);
  };

  const openAuthorProfile = () => {
    closeSearch();
    router.push({
      pathname: "/profile",
      params: { author: post.author, id: post.id },
    });
  };

  const handleLike = () => {
    setIsLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleShare = () => {
    Share.share({
      message: `${post.title} — ${post.author} (${post.place}) on Olive!`,
    });
  };

  const handleGuide = () => {
    startGuidance(post);
  };

  return (
    <View style={styles.card}>
      {/* Author Header (hidden on profile screen where author is already displayed) */}
      {!hideAuthor && (
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${post.author}'s profile`}
            onPress={openAuthorProfile}
            style={styles.authorGroup}
          >
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: colors.surfaceMuted },
              ]}
            >
              {post.image ? (
                <Image source={post.image} style={styles.avatarPhoto} />
              ) : (
                <Text style={[styles.avatarLetter, { color: colors.text }]}>
                  {post.author[0]}
                </Text>
              )}
            </View>
            <View style={styles.authorMeta}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {post.author}
              </Text>
              <Text style={[styles.authorSub, { color: colors.muted }]}>
                {post.kind} · {post.category} · {post.distanceKm} km
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Image with Time Badge */}
      <Pressable
        accessibilityRole="button"
        onPress={openPlace}
        style={styles.imageWrap}
      >
        <Image source={post.image} style={styles.postImage} />
        <View
          style={[
            styles.whenBadge,
            { backgroundColor: colors.badgeBg, borderColor: colors.line },
          ]}
        >
          <Text style={[styles.whenBadgeText, { color: colors.badgeText }]}>
            {post.when}
          </Text>
        </View>
      </Pressable>

      {/* 1. Tactical & Social Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeftGroup}>
          {/* Like */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLiked ? "Unlike post" : "Like post"}
            onPress={handleLike}
            style={({ pressed }) => [
              styles.actionItem,
              { opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#FF3B30" : colors.text}
            />
            <Text style={[styles.actionCount, { color: colors.text }]}>
              {likeCount}
            </Text>
          </Pressable>

          {/* Comments / Reviews */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${reviews.length} reviews`}
            onPress={() => openExpandedWindow({ type: "comments", post })}
            style={({ pressed }) => [
              styles.actionItem,
              { opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
            {reviews.length > 0 && (
              <Text style={[styles.actionCount, { color: colors.text }]}>
                {reviews.length}
              </Text>
            )}
          </Pressable>

          {/* Share */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share place"
            onPress={handleShare}
            style={({ pressed }) => [
              styles.actionItem,
              { opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Ionicons name="flower-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Bookmark */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove bookmark" : "Save place"}
          onPress={() => toggleSave(post.id)}
          style={({ pressed }) => [
            styles.actionBookmarkBtn,
            { opacity: pressed ? 0.65 : 1 },
          ]}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? colors.signal : colors.text}
          />
        </Pressable>
      </View>

      {/* 2. Editorial Post Content & Story Narrative */}
      <View style={styles.postBodySection}>
        {/* Drop Headline */}
        <Pressable onPress={openPlace} style={styles.titleWrap}>
          <Text
            style={[styles.postTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {post.title}
          </Text>
        </Pressable>

        {/* Narrative Caption */}
        <Pressable
          onPress={() => setCaptionExpanded((prev) => !prev)}
          style={styles.captionWrap}
        >
          <Text
            style={[styles.captionText, { color: colors.textSecondary }]}
            numberOfLines={captionExpanded ? undefined : 2}
          >
            <Text style={[styles.captionAuthor, { color: colors.text }]}>
              {post.author}{" "}
            </Text>
            {post.body}
          </Text>
          {post.body.length > 85 && !captionExpanded && (
            <Text style={[styles.captionMore, { color: colors.muted }]}>
              more
            </Text>
          )}
        </Pressable>

        {/* Hyperlocal Venue Capsule & Details Sheet Trigger */}
        <View style={styles.venueRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Location: ${post.place}`}
            onPress={openPlace}
            style={[
              styles.venueCapsule,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
              },
            ]}
          >
            <Ionicons name="location-sharp" size={12} color={colors.signal} />
            <Text
              numberOfLines={1}
              style={[styles.venueCapsuleText, { color: colors.text }]}
            >
              {post.place}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open details sheet"
            onPress={() => openExpandedWindow({ type: "details", post })}
            style={[
              styles.detailsChip,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
              },
            ]}
          >
            <Text
              style={[styles.detailsChipText, { color: colors.textSecondary }]}
            >
              Details
            </Text>
            <Ionicons name="chevron-forward" size={11} color={colors.muted} />
          </Pressable>
        </View>

        {/* Community Review Highlight (Social Proof) */}
        {latestReview && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Community review from ${latestReview.by}`}
            onPress={() => openExpandedWindow({ type: "comments", post })}
            style={[styles.reviewHighlight, { borderLeftColor: colors.signal }]}
          >
            <Text
              numberOfLines={1}
              style={[styles.reviewQuote, { color: colors.muted }]}
            >
              <Text style={[styles.reviewAuthorPrefix, { color: colors.text }]}>
                {latestReview.by}:{" "}
              </Text>
              “{latestReview.text}”
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 36,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  authorGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: "700",
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  authorSub: {
    fontSize: 12.5,
    marginTop: 1,
  },

  imageWrap: {
    width: "100%",
    aspectRatio: POST_MEDIA_ASPECT_RATIO,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    resizeMode: "cover",
  },
  whenBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  whenBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  /* Action Bar */
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 6,
  },
  actionLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "#E6CDBA50",
    borderColor: "#E6CDBA",
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionBookmarkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "#E6CDBA50",
    borderColor: "#E6CDBA",
  },

  /* Post Content & Story Narrative */
  postBodySection: {
    gap: 7,
    marginTop: 2,
  },
  titleWrap: {
    marginTop: 2,
  },
  postTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  captionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  captionText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  captionAuthor: {
    fontWeight: "700",
  },
  captionMore: {
    fontSize: 12.5,
    fontWeight: "600",
    marginLeft: 4,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  venueCapsule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    flexShrink: 1,
  },
  venueCapsuleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  detailsChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reviewHighlight: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    paddingVertical: 2,
    marginTop: 3,
  },
  reviewQuote: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
  },
  reviewAuthorPrefix: {
    fontWeight: "700",
    fontStyle: "normal",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: "100%",
    height: "98%",
    borderRadius: 32,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  modalClose: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  modalTabBtnText: {
    fontSize: 13,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  detailsContent: {
    gap: 14,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  detailBody: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  infoGrid: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  guideActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 9999,
    marginTop: 8,
  },
  guideActionText: {
    fontSize: 15,
    fontWeight: "700",
  },
  reviewsContent: {
    gap: 12,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarLetter: {
    fontSize: 12,
    fontWeight: "700",
  },
  reviewAuthor: {
    fontSize: 13.5,
    fontWeight: "600",
    flex: 1,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
  },
  relatedContent: {
    gap: 10,
  },
  relatedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  relatedMeta: {
    flex: 1,
    marginRight: 12,
  },
  relatedTitle: {
    fontSize: 14.5,
    fontWeight: "600",
  },
  relatedSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  relatedDist: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13.5,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 32,
  },
});

import { useState } from "react";
import { Image, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Post } from "../models";
import { relatedPosts, REVIEWS } from "../places";
import { useOlive } from "../context/OliveProvider";
import { colors } from "../constants/colors";

export const POST_MEDIA_ASPECT_RATIO = 1;

export function PostCard({
  post,
  hideAuthor = false,
}: {
  post: Post;
  hideAuthor?: boolean;
}) {
  const { isSaved, toggleSave, closeSearch, openExpandedWindow, reviewsMap } =
    useOlive();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    () => Math.floor(Math.abs(post.lat * 100) % 35) + 8
  );
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const reviews = reviewsMap[post.id] ?? REVIEWS[post.id] ?? [];
  const latestReview = reviews.length > 0 ? reviews[0] : null;
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

  return (
    <View style={styles.card}>
      {/* Author Header */}
      {!hideAuthor && (
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${post.author}'s profile`}
            onPress={openAuthorProfile}
            style={styles.authorGroup}
          >
            <View style={styles.avatarCircle}>
              {post.image ? (
                <Image source={post.image} style={styles.avatarPhoto} />
              ) : (
                <Text style={styles.avatarLetter}>{post.author[0]}</Text>
              )}
            </View>
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.authorSub}>
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
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#FF3B30" : colors.text}
            />
            <Text style={styles.actionCount}>{likeCount}</Text>
          </Pressable>

          {/* Comments / Reviews */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${reviews.length} reviews`}
            onPress={() => openExpandedWindow({ type: "comments", post })}
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
            {reviews.length > 0 && (
              <Text style={styles.actionCount}>{reviews.length}</Text>
            )}
          </Pressable>

          {/* Share */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share place"
            onPress={handleShare}
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.pressed,
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
            pressed && styles.pressed,
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
          <Text style={styles.postTitle} numberOfLines={2}>
            {post.title}
          </Text>
        </Pressable>

        {/* Narrative Caption */}
        <Pressable
          onPress={() => setCaptionExpanded((prev) => !prev)}
          style={styles.captionWrap}
        >
          <Text
            style={styles.captionText}
            numberOfLines={captionExpanded ? undefined : 2}
          >
            <Text style={styles.captionAuthor}>{post.author} </Text>
            {post.body}
          </Text>
          {post.body.length > 85 && !captionExpanded && (
            <Text style={styles.captionMore}>more</Text>
          )}
        </Pressable>

        {/* Venue Capsule & Details Trigger */}
        <View style={styles.venueRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Location: ${post.place}`}
            onPress={openPlace}
            style={styles.venueCapsule}
          >
            <Ionicons name="location-sharp" size={12} color={colors.signal} />
            <Text numberOfLines={1} style={styles.venueCapsuleText}>
              {post.place}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open details sheet"
            onPress={() => openExpandedWindow({ type: "details", post })}
            style={styles.detailsChip}
          >
            <Text style={styles.detailsChipText}>Details</Text>
            <Ionicons name="chevron-forward" size={11} color={colors.muted} />
          </Pressable>
        </View>

        {/* Community Review Highlight */}
        {latestReview && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Community review from ${latestReview.by}`}
            onPress={() => openExpandedWindow({ type: "comments", post })}
            style={styles.reviewHighlight}
          >
            <Text numberOfLines={1} style={styles.reviewQuote}>
              <Text style={styles.reviewAuthorPrefix}>{latestReview.by}: </Text>
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
    backgroundColor: colors.surfaceMuted,
  },
  avatarPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  authorSub: {
    fontSize: 12.5,
    marginTop: 1,
    color: colors.muted,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: POST_MEDIA_ASPECT_RATIO,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 4,
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
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  pressed: {
    opacity: 0.65,
  },
  postBodySection: {
    paddingTop: 8,
    gap: 4,
  },
  titleWrap: {
    paddingVertical: 1,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    color: colors.text,
  },
  captionWrap: {
    paddingVertical: 1,
  },
  captionText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  captionAuthor: {
    fontWeight: "700",
    color: colors.text,
  },
  captionMore: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 2,
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
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  venueCapsuleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  detailsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  detailsChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  reviewHighlight: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    paddingVertical: 2,
    marginTop: 3,
    borderLeftColor: colors.signal,
  },
  reviewQuote: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
    color: colors.muted,
  },
  reviewAuthorPrefix: {
    fontWeight: "700",
    fontStyle: "normal",
    color: colors.text,
  },
});

import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareMore,
  Star,
} from "lucide-react-native";
import { useOlive } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { PostCard } from "../PostCard";
import type { Post, Review } from "../../models";

export interface UserInteraction {
  post: Post;
  review: Review;
  timeAgo: string;
}

interface ProfileInteractionsTabProps {
  likedPosts: Post[];
  interactions: UserInteraction[];
  userName: string;
  isMe: boolean;
}

export function ProfileInteractionsTab({
  likedPosts,
  interactions,
  userName,
  isMe,
}: ProfileInteractionsTabProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { openExpandedWindow } = useOlive();
  const [filter, setFilter] = useState<"all" | "liked" | "comments">("all");

  const totalCount = likedPosts.length + interactions.length;

  if (totalCount === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Heart size={44} color={colors.muted} />
        <Text style={styles.emptyTitle}>No interactions yet</Text>
        <Text style={styles.emptyText}>
          {isMe
            ? "Places you like and reviews you post will appear together here."
            : `Places that ${userName} liked and reviewed will appear here.`}
        </Text>
      </View>
    );
  }

  const showLiked = filter === "all" || filter === "liked";
  const showComments = filter === "all" || filter === "comments";

  return (
    <View style={styles.container}>
      {/* Sub-Filter Pills (All, Liked, Comments) */}
      <View style={styles.filterRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Show all ${totalCount} interactions`}
          onPress={() => setFilter("all")}
          style={[
            styles.filterPill,
            filter === "all" && styles.filterPillActive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All ({totalCount})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Show ${likedPosts.length} liked places`}
          onPress={() => setFilter("liked")}
          style={[
            styles.filterPill,
            filter === "liked" && styles.filterPillActive,
          ]}
        >
          <Heart
            size={12}
            color={filter === "liked" ? "#FF3B30" : colors.muted}
            fill={filter === "liked" ? "#FF3B30" : "none"}
          />
          <Text
            style={[
              styles.filterText,
              filter === "liked" && styles.filterTextActive,
            ]}
          >
            Liked ({likedPosts.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Show ${interactions.length} comments`}
          onPress={() => setFilter("comments")}
          style={[
            styles.filterPill,
            filter === "comments" && styles.filterPillActive,
          ]}
        >
          <MessageSquareMore
            size={12}
            color={filter === "comments" ? colors.signal : colors.muted}
          />
          <Text
            style={[
              styles.filterText,
              filter === "comments" && styles.filterTextActive,
            ]}
          >
            Comments ({interactions.length})
          </Text>
        </Pressable>
      </View>

      {/* 1. Comments Section */}
      {showComments && interactions.length > 0 && (
        <View style={styles.sectionWrap}>
          {filter === "all" && (
            <View style={styles.sectionHeader}>
              <MessageSquareMore
                size={14}
                color={colors.signal}
              />
              <Text style={styles.sectionHeaderText}>
                Comments & Reviews ({interactions.length})
              </Text>
            </View>
          )}

          <View style={styles.list}>
            {interactions.map(({ post, review, timeAgo }, idx) => (
              <Pressable
                key={`interaction-${post.id}-${idx}`}
                accessibilityRole="button"
                accessibilityLabel={`Interaction on ${post.title}`}
                onPress={() => openExpandedWindow({ type: "details", post })}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                {/* Target Place Row */}
                <View style={styles.targetPostRow}>
                  {post.image ? (
                    <Image source={post.image} style={styles.placeThumb} />
                  ) : (
                    <View style={styles.placeThumbPlaceholder}>
                      <MapPin
                        size={16}
                        color={colors.signal}
                      />
                    </View>
                  )}
                  <View style={styles.placeMeta}>
                    <Text numberOfLines={1} style={styles.placeTitle}>
                      {post.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.placeSub}>
                      {post.author} · {post.place}
                    </Text>
                  </View>
                  <ChevronRight
                    size={16}
                    color={colors.muted}
                  />
                </View>

                {/* Speech Bubble */}
                <View style={styles.commentBubble}>
                  <View style={styles.bubbleHeaderRow}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={`star-${star}`}
                          size={12}
                          color={
                            star <= review.stars ? colors.signal : colors.muted
                          }
                          fill={
                            star <= review.stars ? colors.signal : "none"
                          }
                        />
                      ))}
                    </View>
                    <Text style={styles.timeAgo}>{timeAgo}</Text>
                  </View>

                  <Text style={styles.reviewText}>"{review.text}"</Text>

                  <View style={styles.reviewFooter}>
                    <MessageSquareMore
                      size={12}
                      color={colors.muted}
                    />
                    <Text style={styles.authorBadge}>
                      {isMe ? "You reviewed" : `${userName} reviewed`}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* 2. Liked Posts Section */}
      {showLiked && likedPosts.length > 0 && (
        <View style={styles.sectionWrap}>
          {filter === "all" && (
            <View style={styles.sectionHeader}>
              <Heart size={14} color="#FF3B30" fill="#FF3B30" />
              <Text style={styles.sectionHeaderText}>
                Liked Places ({likedPosts.length})
              </Text>
            </View>
          )}

          <View style={styles.list}>
            {likedPosts.map((post) => (
              <View key={`liked-post-${post.id}`} style={styles.likedPostWrap}>
                <View style={styles.likedHeader}>
                  <Heart size={13} color="#FF3B30" fill="#FF3B30" />
                  <Text style={styles.likedHeaderText}>
                    {isMe
                      ? "You liked this place"
                      : `${userName} liked this place`}
                  </Text>
                </View>
                <PostCard post={post} />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    filterPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 9999,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.line,
    },
    filterPillActive: {
      backgroundColor: colors.surface,
      borderColor: colors.signal,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.muted,
    },
    filterTextActive: {
      fontWeight: "700",
      color: colors.text,
    },
    sectionWrap: {
      gap: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 4,
      marginTop: 4,
    },
    sectionHeaderText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    list: {
      gap: 12,
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 12,
      gap: 10,
    },
    cardPressed: {
      opacity: 0.85,
    },
    targetPostRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    placeThumb: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: colors.surfaceMuted,
    },
    placeThumbPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    placeMeta: {
      flex: 1,
      justifyContent: "center",
    },
    placeTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 18,
    },
    placeSub: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.muted,
      lineHeight: 16,
      marginTop: 2,
    },
    commentBubble: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      padding: 12,
      gap: 6,
    },
    bubbleHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    starsRow: {
      flexDirection: "row",
      gap: 2,
    },
    timeAgo: {
      fontSize: 12,
      color: colors.muted,
    },
    reviewText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      fontStyle: "italic",
    },
    reviewFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    authorBadge: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
    },
    likedPostWrap: {
      marginBottom: 4,
    },
    likedHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 8,
      marginBottom: 4,
    },
    likedHeaderText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    emptyWrap: {
      alignItems: "center",
      paddingVertical: 56,
      paddingHorizontal: 24,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      color: colors.muted,
    },
  });

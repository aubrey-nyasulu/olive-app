import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ChevronRight,
  Footprints,
  Heart,
  MapPin,
  MessageSquareMore,
  Star,
} from "lucide-react-native";
import { useOlive } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { PostCard } from "../PostCard";
import type { Post, Review } from "../../models";
import { useMorphTrigger } from "../popup/MorphTrigger";

export interface UserInteraction {
  post: Post;
  review: Review;
  timeAgo: string;
  minutesAgo?: number;
}

interface ProfileInteractionsTabProps {
  likedPosts: Post[];
  interactions: UserInteraction[];
  userName: string;
  isMe: boolean;
}

type TimelineEntry =
  | {
      kind: "review";
      key: string;
      minutesAgo: number;
      interaction: UserInteraction;
    }
  | {
      kind: "liked";
      key: string;
      minutesAgo: number;
      timeAgo: string;
      post: Post;
    };

const LIKED_SCHEDULES = [
  { timeAgo: "5h ago", minutesAgo: 300 },
  { timeAgo: "2d ago", minutesAgo: 2880 },
  { timeAgo: "4d ago", minutesAgo: 5760 },
  { timeAgo: "6d ago", minutesAgo: 8640 },
];

function parseMinutesFallback(timeAgo: string): number {
  const match = timeAgo.match(/^(\d+)\s*([mhdw])/i);
  if (!match) return 4320;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "m") return amount;
  if (unit === "h") return amount * 60;
  if (unit === "d") return amount * 1440;
  if (unit === "w") return amount * 10080;
  return 4320;
}

function InteractionReviewCard({
  entryKey,
  post,
  review,
  timeAgo,
  userName,
  isMe,
}: {
  entryKey: string;
  post: Post;
  review: Review;
  timeAgo: string;
  userName: string;
  isMe: boolean;
}) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { openPopup } = useOlive();
  const cardTrigger = useMorphTrigger(`interaction-${entryKey}`);

  return (
    <Pressable
      ref={cardTrigger.triggerRef}
      collapsable={false}
      accessibilityRole="button"
      accessibilityLabel={`Interaction on ${post.title}`}
      onPress={() =>
        cardTrigger.measureAndOpen((rect) =>
          openPopup(
            { type: "details", post },
            {
              triggerId: `interaction-${entryKey}`,
              rect,
              style: {
                borderRadius: 16,
                backgroundColor: colors.surface,
                borderColor: colors.line,
                borderWidth: 1,
              },
              headerMorph: {
                headerTitle: post.place,
                headerSubtitle: `${post.author} · ${post.category} · ${post.distanceKm} km`,
              },
            }
          )
        )
      }
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        cardTrigger.isMorphedOut && styles.morphedOut,
      ]}
    >
      <View style={styles.targetPostRow}>
        {post.image ? (
          <Image source={post.image} style={styles.placeThumb} />
        ) : (
          <View style={styles.placeThumbPlaceholder}>
            <MapPin size={16} color={colors.signal} />
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
        <ChevronRight size={16} color={colors.muted} />
      </View>

      <View style={styles.commentBubble}>
        <View style={styles.bubbleHeaderRow}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={`star-${star}`}
                size={12}
                color={star <= review.stars ? colors.signal : colors.muted}
                fill={star <= review.stars ? colors.signal : "none"}
              />
            ))}
          </View>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>

        <Text style={styles.reviewText}>"{review.text}"</Text>

        <View style={styles.reviewFooter}>
          <MessageSquareMore size={12} color={colors.muted} />
          <Text style={styles.authorBadge}>
            {isMe ? "You reviewed" : `${userName} reviewed`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ProfileInteractionsTab({
  likedPosts,
  interactions,
  userName,
  isMe,
}: ProfileInteractionsTabProps) {
  const { styles, colors } = useThemeStyles(createStyles);

  const timeline = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [
      ...interactions.map((item, idx) => ({
        kind: "review" as const,
        key: `review-${item.post.id}-${idx}`,
        minutesAgo: item.minutesAgo ?? parseMinutesFallback(item.timeAgo),
        interaction: item,
      })),
      ...likedPosts.map((post, idx) => {
        const schedule =
          LIKED_SCHEDULES[idx] ?? {
            timeAgo: `${idx + 3}d ago`,
            minutesAgo: (idx + 3) * 1440,
          };
        return {
          kind: "liked" as const,
          key: `liked-${post.id}`,
          minutesAgo: schedule.minutesAgo,
          timeAgo: schedule.timeAgo,
          post,
        };
      }),
    ];

    entries.sort((a, b) => a.minutesAgo - b.minutesAgo);
    return entries;
  }, [interactions, likedPosts]);

  if (timeline.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Footprints size={44} color={colors.muted} />
        <Text style={styles.emptyTitle}>No footprints yet</Text>
        <Text style={styles.emptyText}>
          {isMe
            ? "Places you like and reviews you post will appear in chronological order here."
            : `Places that ${userName} liked and reviewed will appear in chronological order here.`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {timeline.map((entry) => {
        if (entry.kind === "review") {
          const { post, review, timeAgo } = entry.interaction;
          return (
            <InteractionReviewCard
              key={entry.key}
              entryKey={entry.key}
              post={post}
              review={review}
              timeAgo={timeAgo}
              userName={userName}
              isMe={isMe}
            />
          );
        }

        return (
          <View key={entry.key} style={styles.likedPostWrap}>
            <View style={styles.likedHeader}>
              <View style={styles.likedHeaderLeft}>
                <Heart size={13} color="#FF3B30" fill="#FF3B30" />
                <Text style={styles.likedHeaderText}>
                  {isMe
                    ? "You liked this place"
                    : `${userName} liked this place`}
                </Text>
              </View>
              <Text style={styles.timeAgo}>{entry.timeAgo}</Text>
            </View>
            <PostCard post={entry.post} />
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      gap: 14,
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
    morphedOut: {
      opacity: 0,
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
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 8,
      marginBottom: 4,
    },
    likedHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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

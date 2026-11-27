import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ChevronRight,
  Footprints,
  MapPin,
  MessageSquareMore,
  Star,
} from "lucide-react-native";
import { useOlive } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { PostCard } from "../PostCard";
import type { Post, ReactionType, Review } from "../../models";
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

const OTHER_USER_REACTIONS: Record<string, ReactionType> = {
  forno: "heart",
  "kuchawe-chambo": "flower",
  "park-live": "fire",
};

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
    <View style={styles.reviewWrap}>
      {/* Banner matching PostCard's repost/reaction banner */}
      <View style={styles.activityBanner}>
        <View style={styles.activityMiniAvatar}>
          <MessageSquareMore size={12} color={colors.signal} />
        </View>
        <Text numberOfLines={1} style={styles.activityBannerText}>
          <Text style={styles.activityBannerAuthor}>
            {isMe ? "You" : userName}
          </Text>{" "}
          reviewed · {timeAgo}
        </Text>
      </View>

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
                  borderRadius: 24,
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

        <View style={styles.quoteBlock}>
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
          <Text style={styles.reviewText}>&ldquo;{review.text}&rdquo;</Text>
        </View>
      </Pressable>
    </View>
  );
}

export function ProfileInteractionsTab({
  likedPosts,
  interactions,
  userName,
  isMe,
}: ProfileInteractionsTabProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { getUserReaction } = useOlive();

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

        const reaction: ReactionType = isMe
          ? getUserReaction(entry.post.id) ?? "heart"
          : OTHER_USER_REACTIONS[entry.post.id] ?? "heart";

        const reactedPost: Post = {
          ...entry.post,
          repostedBy: null,
          quoteNote: null,
          reactedBy: {
            name: userName,
            reaction,
            time: entry.timeAgo,
          },
        };

        return <PostCard key={entry.key} post={reactedPost} />;
      })}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      gap: 0,
    },
    reviewWrap: {
      marginBottom: 36,
    },
    activityBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 4,
      paddingBottom: 10,
    },
    activityMiniAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.line,
      alignItems: "center",
      justifyContent: "center",
    },
    activityBannerText: {
      fontSize: 12.5,
      color: colors.muted,
      flexShrink: 1,
    },
    activityBannerAuthor: {
      color: colors.text,
      fontWeight: "700",
    },
    card: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 12,
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
      gap: 12,
    },
    placeThumb: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
    },
    placeThumbPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    placeMeta: {
      flex: 1,
      justifyContent: "center",
    },
    placeTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 20,
    },
    placeSub: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.muted,
      lineHeight: 16,
      marginTop: 2,
    },
    quoteBlock: {
      borderLeftWidth: 2,
      borderLeftColor: colors.signal,
      paddingLeft: 12,
      paddingVertical: 2,
      gap: 6,
    },
    starsRow: {
      flexDirection: "row",
      gap: 2,
    },
    reviewText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      fontStyle: "italic",
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

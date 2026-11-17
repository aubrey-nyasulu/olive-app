import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Post, Review } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";

const userAvatar = require("../../../../assets/images/profile-avatar.jpg");

interface CommentsViewProps {
  post: Post;
  reviews: Review[];
}

export function CommentsView({ post, reviews }: CommentsViewProps) {
  const { colors } = useOlive();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Reviews & Comments
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
            {post.author} · {post.place}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.badgeText, { color: colors.signal }]}>
            {reviews.length} {reviews.length === 1 ? "note" : "notes"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={36}
              color={colors.muted}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No reviews yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Be the first to visit and share your experience below.
            </Text>
          </View>
        ) : (
          reviews.map((rev, idx) => (
            <View
              key={`${rev.by}-${idx}`}
              style={[
                styles.reviewCard,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              <View style={styles.reviewTop}>
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  {rev.by === "Chisomo Banda" ? (
                    <Image source={userAvatar} style={styles.avatarPhoto} />
                  ) : (
                    <Text
                      style={[styles.avatarLetter, { color: colors.text }]}
                    >
                      {rev.by[0]}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.authorName, { color: colors.text }]}>
                    {rev.by}
                  </Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={11}
                        color={colors.signal}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text
                style={[styles.reviewText, { color: colors.textSecondary }]}
              >
                {rev.text}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarPhoto: {
    width: "100%",
    height: "100%",
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: "700",
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 1,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Post, Review } from "../../../models";
import { colors } from "../../../constants/colors";

const userAvatar = require("../../../../assets/images/profile-avatar.jpg");

interface CommentsViewProps {
  post: Post;
  reviews: Review[];
}

export function CommentsView({ post, reviews }: CommentsViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerMeta}>
          <Text style={styles.title}>
            Reviews & Comments
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {post.author} · {post.place}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
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
            <Text style={styles.emptyTitle}>
              No reviews yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Be the first to visit and share your experience below.
            </Text>
          </View>
        ) : (
          reviews.map((rev, idx) => (
            <View key={`${rev.by}-${idx}`} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={styles.avatarCircle}>
                  {rev.by === "Chisomo Banda" ? (
                    <Image source={userAvatar} style={styles.avatarPhoto} />
                  ) : (
                    <Text style={styles.avatarLetter}>
                      {rev.by[0]}
                    </Text>
                  )}
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.authorName}>
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
              <Text style={styles.reviewText}>
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
  headerMeta: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
    color: colors.muted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.signal,
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
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
    color: colors.muted,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
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
    backgroundColor: colors.surface,
  },
  avatarPhoto: {
    width: "100%",
    height: "100%",
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  reviewMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.text,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 1,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});

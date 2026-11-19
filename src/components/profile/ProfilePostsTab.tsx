import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { PostCard } from "../PostCard";
import type { Post } from "../../models";

interface ProfilePostsTabProps {
  posts: Post[];
  userName: string;
}

export function ProfilePostsTab({ posts, userName }: ProfilePostsTabProps) {
  if (posts.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="calendar-outline" size={44} color={colors.muted} />
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyText}>
          Posts by {userName} will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} hideAuthor />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
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
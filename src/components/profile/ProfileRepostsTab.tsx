import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { PostCard } from "../PostCard";
import type { Post } from "../../models";

interface ProfileRepostsTabProps {
  posts: Post[];
  userName: string;
}

export function ProfileRepostsTab({ posts, userName }: ProfileRepostsTabProps) {
  const { styles, colors } = useThemeStyles(createStyles);

  if (posts.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="repeat-outline" size={44} color={colors.muted} />
        <Text style={styles.emptyTitle}>No reposts yet</Text>
        <Text style={styles.emptyText}>
          Posts that {userName} reposts from the community will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {posts.map((post) => (
        <View key={`repost-${post.id}`} style={styles.itemWrap}>
          <View style={styles.repostHeader}>
            <Ionicons name="repeat" size={14} color={colors.signal} />
            <Text style={styles.repostHeaderText}>{userName} reposted</Text>
          </View>
          <PostCard post={post} />
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    list: {
      gap: 0,
    },
    itemWrap: {
      marginBottom: 8,
    },
    repostHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 8,
      marginBottom: 4,
    },
    repostHeaderText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.signal,
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

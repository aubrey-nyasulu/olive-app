import { StyleSheet, Text, View } from "react-native";
import { Repeat2 } from "lucide-react-native";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { useOlive } from "../../context/OliveProvider";
import { PostCard } from "../PostCard";
import type { Post } from "../../models";

interface ProfileRepostsTabProps {
  posts: Post[];
  userName: string;
  isMe?: boolean;
}

export function ProfileRepostsTab({
  posts,
  userName,
  isMe = false,
}: ProfileRepostsTabProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { getUserQuoteNote } = useOlive();

  if (posts.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Repeat2 size={44} color={colors.muted} />
        <Text style={styles.emptyTitle}>No reposts yet</Text>
        <Text style={styles.emptyText}>
          Posts that {userName} reposts from the community will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {posts.map((post) => {
        const quoteNote = isMe
          ? getUserQuoteNote(post.id) ?? post.quoteNote ?? null
          : post.quoteNote ?? null;
        const repostedPost: Post = {
          ...post,
          repostedBy: post.repostedBy ?? {
            name: userName,
            role: quoteNote ? "Local Guide · Just now" : undefined,
            time: "Reposted",
          },
          quoteNote,
        };
        return <PostCard key={`repost-${post.id}`} post={repostedPost} />;
      })}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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

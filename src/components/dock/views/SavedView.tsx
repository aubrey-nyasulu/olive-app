import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Post } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";

interface SavedViewProps {
  savedPosts: Post[];
  onSelectPlace: (placeId: string) => void;
  onRemove: (placeId: string) => void;
}

export function SavedView({ savedPosts, onSelectPlace, onRemove }: SavedViewProps) {
  const { colors } = useOlive();

  const handleShare = () => {
    Share.share({
      message: `My saved places on Olive: ${savedPosts.map((p) => p.author).join(", ")}`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            Saved Places
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {savedPosts.length} places saved for quick access
          </Text>
        </View>
        {savedPosts.length > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={handleShare}
            style={[styles.shareBtn, { backgroundColor: colors.surfaceMuted }]}
          >
            <Ionicons name="share-social-outline" size={14} color={colors.text} />
            <Text style={[styles.shareText, { color: colors.text }]}>Share</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {savedPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={38} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nothing saved yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Tap the bookmark icon on any post in the feed to save it here.
            </Text>
          </View>
        ) : (
          savedPosts.map((post) => (
            <View
              key={post.id}
              style={[
                styles.itemRow,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              <Pressable
                onPress={() => onSelectPlace(post.id)}
                style={styles.itemPressable}
              >
                <Image source={post.image} style={styles.itemThumb} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={[styles.itemTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {post.author}
                  </Text>
                  <Text
                    style={[styles.itemSub, { color: colors.muted }]}
                    numberOfLines={1}
                  >
                    {post.place} · {post.distanceKm} km
                  </Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove from saved"
                onPress={() => onRemove(post.id)}
                style={styles.trashBtn}
              >
                <Ionicons name="trash-outline" size={17} color={colors.muted} />
              </Pressable>
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
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  shareText: {
    fontSize: 12,
    fontWeight: "600",
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  itemPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  itemSub: {
    fontSize: 11.5,
  },
  trashBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});

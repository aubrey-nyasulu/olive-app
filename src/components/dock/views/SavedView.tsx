import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Share2, Bookmark, MapPin, Trash2 } from "lucide-react-native";
import type { Post } from "../../../models";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface SavedViewProps {
  savedPosts: Post[];
  onSelectPlace: (placeId: string) => void;
  onRemove: (placeId: string) => void;
  hideHeader?: boolean;
}

export function SavedView({
  savedPosts,
  onSelectPlace,
  onRemove,
  hideHeader = false,
}: SavedViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const handleShare = () => {
    Share.share({
      message: `My saved places on Olive: ${savedPosts.map((p) => p.author).join(", ")}`,
    });
  };

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Saved Places
            </Text>
            <Text style={styles.subtitle}>
              {savedPosts.length} places saved for quick access
            </Text>
          </View>
          {savedPosts.length > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={handleShare}
              style={styles.shareBtn}
            >
              <Share2 size={14} color={colors.text} />
              <Text style={styles.shareText}>Share</Text>
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          hideHeader && { paddingTop: 14, paddingBottom: 20 },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {savedPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bookmark size={38} color={colors.muted} />
            <Text style={styles.emptyTitle}>
              Nothing saved yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Tap the bookmark icon on any post in the feed to save it here.
            </Text>
          </View>
        ) : (
          savedPosts.map((post) => (
            <View key={post.id} style={styles.itemRow}>
              <Pressable
                onPress={() => onSelectPlace(post.id)}
                style={styles.itemPressable}
              >
                {post.image ? (
                  <Image source={post.image} style={styles.itemThumb} />
                ) : (
                  <View style={styles.itemThumbFallback}>
                    <MapPin size={16} color={colors.signal} />
                  </View>
                )}
                <View style={styles.itemMeta}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {post.author}
                  </Text>
                  <Text style={styles.itemSub} numberOfLines={1}>
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
                <Trash2 size={17} color={colors.muted} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  shareText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    gap: 8,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
    color: colors.muted,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  itemPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  itemThumbFallback: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.signalLight,
    alignItems: "center",
    justifyContent: "center",
  },
  itemMeta: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  itemSub: {
    fontSize: 12,
    color: colors.muted,
  },
  trashBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

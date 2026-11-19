import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Post } from "../../../models";
import { relatedPosts } from "../../../places";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface RelatedViewProps {
  post: Post;
  onSelectPlace: (placeId: string) => void;
}

export function RelatedView({ post, onSelectPlace }: RelatedViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const related = relatedPosts(post);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Similar Places Nearby
        </Text>
        <Text style={styles.subtitle}>
          Discovered around {post.place}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {related.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptySubtitle}>
              No similar places nearby right now.
            </Text>
          </View>
        ) : (
          related.map((rel) => (
            <Pressable
              key={rel.id}
              onPress={() => onSelectPlace(rel.id)}
              style={({ pressed }) => [
                styles.itemCard,
                pressed && styles.pressed,
              ]}
            >
              <Image source={rel.image} style={styles.itemThumb} />
              <View style={styles.itemMeta}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {rel.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {rel.author} · {rel.place}
                </Text>
              </View>
              <Text style={styles.itemDist}>
                {rel.distanceKm} km
              </Text>
            </Pressable>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.75,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
  itemSubtitle: {
    fontSize: 12,
    color: colors.muted,
  },
  itemDist: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.signal,
  },
});

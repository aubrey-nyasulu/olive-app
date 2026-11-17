import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Post } from "../../../models";
import { relatedPosts } from "../../../places";
import { useOlive } from "../../../context/OliveProvider";

interface RelatedViewProps {
  post: Post;
  onSelectPlace: (placeId: string) => void;
}

export function RelatedView({ post, onSelectPlace }: RelatedViewProps) {
  const { colors } = useOlive();
  const related = relatedPosts(post);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Similar Places Nearby
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
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
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
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
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Image source={rel.image} style={styles.itemThumb} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={[styles.itemTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {rel.title}
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: colors.muted }]}
                  numberOfLines={1}
                >
                  {rel.author} · {rel.place}
                </Text>
              </View>
              <Text style={[styles.itemDist, { color: colors.signal }]}>
                {rel.distanceKm} km
              </Text>
            </Pressable>
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
  },
  emptySubtitle: {
    fontSize: 13,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 12,
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
  itemSubtitle: {
    fontSize: 11.5,
  },
  itemDist: {
    fontSize: 12,
    fontWeight: "700",
  },
});

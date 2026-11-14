import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppShell } from "../components/AppShell";
import { PostCard } from "../components/PostCard";
import { getHeaderHeight, Screen } from "../components/Screen";
import { useOlive } from "../context/OliveProvider";
import { POSTS } from "../places";

export default function FeedScreen() {
  const { config, colors } = useOlive();
  const insets = useSafeAreaInsets();
  const headerHeight = getHeaderHeight(insets.top);

  // Filter and sort posts according to user settings (radius & selected categories)
  const sortedPosts = useMemo(() => {
    return [...POSTS]
      .filter((post) => {
        // If user filtered lanes in settings
        const categoryMatch =
          config.lanes.length === 0 || config.lanes.includes(post.category);
        // If radius applies
        const radiusMatch = post.distanceKm <= config.radiusKm * 1.5; // generous buffer for demo
        return categoryMatch && radiusMatch;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [config.lanes, config.radiusKm]);

  return (
    <AppShell>
      <Screen home>
        <FlatList
          data={sortedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerHeight + 8 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No places within {config.radiusKm} km
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                Try expanding your search radius or enabling more categories in your Profile settings.
              </Text>
            </View>
          }
        />
      </Screen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // clearance for floating dock
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
});

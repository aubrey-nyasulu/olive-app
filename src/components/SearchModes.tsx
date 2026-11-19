import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CATEGORIES, POSTS } from "../places";
import { colors } from "../constants/colors";

export function TypeSearch({
  query,
  onSelectCategory,
  onClose,
}: {
  query: string;
  onSelectCategory: (cat: string) => void;
  onClose: () => void;
}) {
  const q = query.trim().toLowerCase();

  const results = q
    ? POSTS.filter((post) =>
        `${post.title} ${post.body} ${post.author} ${post.category} ${post.place}`
          .toLowerCase()
          .includes(q)
      )
    : [];

  return (
    <View style={styles.typeContainer}>
      {q ? (
        results.length > 0 ? (
          <ScrollView
            style={styles.resultsScroll}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {results.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  onClose();
                  router.push(`/p/${item.id}`);
                }}
                style={({ pressed }) => [
                  styles.resultRow,
                  pressed && styles.resultRowPressed,
                ]}
              >
                <View style={styles.resultMeta}>
                  <Text style={styles.resultTitle}>{item.author}</Text>
                  <Text style={styles.resultSubtitle}>{item.title}</Text>
                </View>
                <View style={styles.resultRight}>
                  <Text style={styles.resultDist}>{item.distanceKm} km</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.muted}
                  />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyPrompt}>
              Nothing nearby matches "{query}". Try searching for "coffee",
              "fuel", or "market".
            </Text>
          </View>
        )
      ) : (
        <View style={styles.quickTagsWrap}>
          <Text style={styles.quickTagsHeader}>RIGHT NOW</Text>
          <View style={styles.tagsRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => onSelectCategory(cat)}
                style={({ pressed }) => [
                  styles.tagPill,
                  pressed && styles.tagPillPressed,
                ]}
              >
                <Text style={styles.tagText}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export function VisualSearch() {
  return (
    <View style={styles.visualContainer}>
      <View style={styles.cameraCircle}>
        <Ionicons name="camera-outline" size={36} color={colors.signal} />
      </View>
      <Text style={styles.visualComingSoon}>Visual Finder</Text>
      <Text style={styles.visualSub}>
        Point your camera at the world and Olive will pinpoint where to get it
        nearby.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typeContainer: {
    width: "100%",
    padding: 8,
  },
  resultsScroll: {
    maxHeight: 240,
  },
  resultsList: {
    gap: 8,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  resultRowPressed: {
    opacity: 0.7,
  },
  resultMeta: {
    flex: 1,
    marginRight: 10,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  resultSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    color: colors.muted,
  },
  resultRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultDist: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.signal,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyPrompt: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center",
    color: colors.muted,
  },
  quickTagsWrap: {
    paddingTop: 8,
  },
  quickTagsHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 16,
    color: colors.muted,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  tagPillPressed: {
    opacity: 0.7,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  visualContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  cameraCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  visualComingSoon: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  visualSub: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
    color: colors.muted,
  },
});

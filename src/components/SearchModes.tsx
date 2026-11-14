import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CATEGORIES, POSTS } from "../places";
import { useOlive } from "../context/OliveProvider";

export function TypeSearch({
  query,
  onSelectCategory,
  onClose,
}: {
  query: string;
  onSelectCategory: (cat: string) => void;
  onClose: () => void;
}) {
  const { colors } = useOlive();
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
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.line,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.resultMeta}>
                  <Text style={[styles.resultTitle, { color: colors.text }]}>
                    {item.author}
                  </Text>
                  <Text
                    style={[styles.resultSubtitle, { color: colors.muted }]}
                  >
                    {item.title}
                  </Text>
                </View>
                <View style={styles.resultRight}>
                  <Text style={[styles.resultDist, { color: colors.signal }]}>
                    {item.distanceKm} km
                  </Text>
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
            <Text style={[styles.emptyPrompt, { color: colors.muted }]}>
              Nothing nearby matches "{query}". Try searching for "coffee",
              "fuel", or "market".
            </Text>
          </View>
        )
      ) : (
        <View style={styles.quickTagsWrap}>
          <Text style={[styles.quickTagsHeader, { color: colors.muted }]}>
            RIGHT NOW
          </Text>
          <View style={styles.tagsRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => onSelectCategory(cat)}
                style={({ pressed }) => [
                  styles.tagPill,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.line,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export function VisualSearch() {
  const { colors } = useOlive();

  return (
    <View style={styles.visualContainer}>
      <View
        style={[
          styles.cameraCircle,
          { borderColor: colors.line, backgroundColor: colors.surface },
        ]}
      >
        <Ionicons name="camera-outline" size={36} color={colors.signal} />
      </View>
      <Text style={[styles.visualComingSoon, { color: colors.text }]}>
        Visual Finder
      </Text>
      <Text style={[styles.visualSub, { color: colors.muted }]}>
        Point your camera at the world and Olive will pinpoint where to get it
        nearby.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typeContainer: {
    width: "100%",
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
  },
  resultMeta: {
    flex: 1,
    marginRight: 10,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  resultSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  resultRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultDist: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyPrompt: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center",
  },
  quickTagsWrap: {
    paddingTop: 8,
  },
  quickTagsHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
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
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  voiceContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  waveGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 48,
  },
  waveBar: {
    width: 6,
    height: 36,
    borderRadius: 3,
  },
  voicePrompt: {
    fontSize: 15,
    fontWeight: "700",
  },
  voiceSub: {
    fontSize: 13,
    textAlign: "center",
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
  },
  visualComingSoon: {
    fontSize: 17,
    fontWeight: "700",
  },
  visualSub: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
});

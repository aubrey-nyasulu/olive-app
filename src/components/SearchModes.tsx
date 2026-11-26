import { useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChevronRight, Camera } from "lucide-react-native";
import { CATEGORIES, POSTS } from "../places";
import type { Post } from "../models";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";
import { measureNodeInRoot } from "./popup/MorphTrigger";

function SearchResultRow({
  item,
  onClose,
}: {
  item: Post;
  onClose: () => void;
}) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { openPopup, rootContainerRef } = useOlive();
  const rowRef = useRef<View | null>(null);

  return (
    <Pressable
      ref={rowRef}
      collapsable={false}
      onPress={() => {
        measureNodeInRoot(rowRef.current, rootContainerRef.current).then(
          (rect) => {
            onClose();
            openPopup(
              { type: "details", post: item },
              {
                triggerId: `search-result-${item.id}`,
                rect,
                style: {
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                  borderWidth: 1,
                },
                headerMorph: {
                  headerTitle: item.place,
                  headerSubtitle: `${item.author} · ${item.category} · ${item.distanceKm} km`,
                },
              }
            );
          }
        );
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
        <ChevronRight size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

export function TypeSearch({
  query,
  onSelectCategory,
  onClose,
}: {
  query: string;
  onSelectCategory: (cat: string) => void;
  onClose: () => void;
}) {
  const { styles } = useThemeStyles(createStyles);
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
              <SearchResultRow key={item.id} item={item} onClose={onClose} />
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
  const { styles, colors } = useThemeStyles(createStyles);
  return (
    <View style={styles.visualContainer}>
      <View style={styles.cameraCircle}>
        <Camera size={36} color={colors.signal} />
      </View>
      <Text style={styles.visualComingSoon}>Visual Finder</Text>
      <Text style={styles.visualSub}>
        Point your camera at the world and Olive will pinpoint where to get it
        nearby.
      </Text>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  resultRowPressed: {
    opacity: 0.7,
  },
  resultMeta: {
    flex: 1,
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  resultSubtitle: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
  resultRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultDist: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.signal,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyPrompt: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: colors.muted,
  },
  quickTagsWrap: {
    paddingTop: 8,
  },
  quickTagsHeader: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
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
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  tagPillPressed: {
    opacity: 0.7,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  visualContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  cameraCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  visualComingSoon: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  visualSub: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
    color: colors.muted,
  },
});

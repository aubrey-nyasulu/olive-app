import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getHeaderHeight, IconButton, Screen } from "../components/Screen";
import { PlaceMap } from "../components/PlaceMap";
import { useOlive } from "../context/OliveProvider";
import { getPostById, relatedPosts } from "../places";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isSaved, toggleSave, startGuidance, closeSearch } =
    useOlive();
  const insets = useSafeAreaInsets();
  const headerHeight = getHeaderHeight(insets.top);

  const post = id ? getPostById(id) : undefined;

  if (!post) {
    return (
      <Screen back title="Olive" staticContent>
        <View style={styles.notFoundWrap}>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>
            That place isn't around anymore.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/")}
            style={[styles.backHomeBtn, { backgroundColor: colors.text }]}
          >
            <Text style={[styles.backHomeBtnText, { color: colors.bg }]}>
              Back to feed
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const saved = isSaved(post.id);
  const nearby = relatedPosts(post);

  return (
    <Screen
      back
      title={post.author}
      actions={
        <IconButton
          name={saved ? "bookmark" : "bookmark-outline"}
          label={saved ? "Saved" : "Save place"}
          onPress={() => toggleSave(post.id)}
          color={saved ? colors.signal : colors.text}
        />
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: headerHeight + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta row: Category · Distance · Hours */}
        <Text style={[styles.metaText, { color: colors.muted }]}>
          {post.category} · {post.distanceKm} km · {post.when}
        </Text>

        {/* Place Author / Title */}
        <Text style={[styles.authorHeadline, { color: colors.text }]}>
          {post.author}
        </Text>

        {/* Description */}
        <Text style={[styles.bodyDescription, { color: colors.textSecondary }]}>
          <Text style={[styles.bodyTitlePrefix, { color: colors.text }]}>
            {post.title}.{" "}
          </Text>
          {post.body}
        </Text>

        {/* Re-thought In-App Olive Map */}
        <View style={styles.mapContainer}>
          <PlaceMap post={post} height={240} />
        </View>

        {/* Address Row */}
        <View style={styles.placeRow}>
          <Ionicons name="location" size={16} color={colors.signal} />
          <Text style={[styles.placeText, { color: colors.muted }]}>
            {post.place}
          </Text>
        </View>

        {/* Primary Action: Launch In-App Guidance */}
        <Pressable
          accessibilityRole="button"
          onPress={() => startGuidance(post)}
          style={({ pressed }) => [
            styles.guideBtn,
            {
              backgroundColor: colors.signal,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons
            name="navigate"
            size={18}
            color={colors.signalForeground}
          />
          <Text
            style={[
              styles.guideBtnText,
              { color: colors.signalForeground },
            ]}
          >
            Guide me there
          </Text>
        </Pressable>

        {/* Other Options Nearby */}
        {nearby.length > 0 && (
          <View style={styles.nearbySection}>
            <Text style={[styles.nearbyHeader, { color: colors.muted }]}>
              Other {post.category.toLowerCase()} options nearby
            </Text>

            <View
              style={[
                styles.nearbyCard,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
            >
              {nearby.map((other, idx) => {
                const isLast = idx === nearby.length - 1;
                return (
                  <Pressable
                    key={other.id}
                    onPress={() => {
                      closeSearch();
                      router.push(`/p/${other.id}`);
                    }}
                    style={({ pressed }) => [
                      styles.nearbyRow,
                      {
                        borderBottomColor: colors.line,
                        borderBottomWidth: isLast ? 0 : 1,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View style={styles.nearbyMeta}>
                      <Text
                        style={[styles.nearbyAuthor, { color: colors.text }]}
                      >
                        {other.author}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[styles.nearbyTitle, { color: colors.muted }]}
                      >
                        {other.title}
                      </Text>
                    </View>

                    <View style={styles.nearbyRight}>
                      <Text
                        style={[styles.nearbyDist, { color: colors.signal }]}
                      >
                        {other.distanceKm} km
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={colors.muted}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
  },
  authorHeadline: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  bodyDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  bodyTitlePrefix: {
    fontWeight: "700",
  },
  mapContainer: {
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  placeText: {
    fontSize: 13.5,
  },
  guideBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 9999,
    marginTop: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  guideBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  nearbySection: {
    marginTop: 32,
  },
  nearbyHeader: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  nearbyCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  nearbyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  nearbyMeta: {
    flex: 1,
    marginRight: 12,
  },
  nearbyAuthor: {
    fontSize: 15,
    fontWeight: "700",
  },
  nearbyTitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  nearbyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nearbyDist: {
    fontSize: 13,
    fontWeight: "600",
  },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  backHomeBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

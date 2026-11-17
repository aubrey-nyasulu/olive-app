import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Post } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";

interface DetailsViewProps {
  post: Post;
  onNavigate: () => void;
}

export function DetailsView({ post, onNavigate }: DetailsViewProps) {
  const { colors } = useOlive();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {post.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {post.author} · {post.category}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          {post.body}
        </Text>

        <View
          style={[
            styles.grid,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
            },
          ]}
        >
          <View style={styles.gridRow}>
            <Ionicons name="location-outline" size={16} color={colors.signal} />
            <Text style={[styles.gridLabel, { color: colors.muted }]}>
              Location
            </Text>
            <Text style={[styles.gridValue, { color: colors.text }]}>
              {post.place}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Ionicons name="time-outline" size={16} color={colors.signal} />
            <Text style={[styles.gridLabel, { color: colors.muted }]}>
              Hours
            </Text>
            <Text style={[styles.gridValue, { color: colors.text }]}>
              {post.when}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Ionicons name="navigate-outline" size={16} color={colors.signal} />
            <Text style={[styles.gridLabel, { color: colors.muted }]}>
              Distance
            </Text>
            <Text style={[styles.gridValue, { color: colors.text }]}>
              {post.distanceKm} km away
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onNavigate}
          style={({ pressed }) => [
            styles.navigateBtn,
            {
              backgroundColor: colors.signal,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons
            name="navigate"
            size={16}
            color={colors.signalForeground}
          />
          <Text
            style={[
              styles.navigateBtnText,
              { color: colors.signalForeground },
            ]}
          >
            Start In-App Navigation
          </Text>
        </Pressable>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 6,
  },
  grid: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  gridLabel: {
    fontSize: 12,
    width: 65,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  navigateBtn: {
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  navigateBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

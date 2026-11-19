import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Post } from "../../../models";
import { colors } from "../../../constants/colors";

interface DetailsViewProps {
  post: Post;
  onNavigate: () => void;
}

export function DetailsView({ post, onNavigate }: DetailsViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerMeta}>
          <Text style={styles.title}>
            {post.title}
          </Text>
          <Text style={styles.subtitle}>
            {post.author} · {post.category}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.bodyText}>
          {post.body}
        </Text>

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <Ionicons name="location-outline" size={16} color={colors.signal} />
            <Text style={styles.gridLabel}>
              Location
            </Text>
            <Text style={styles.gridValue}>
              {post.place}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Ionicons name="time-outline" size={16} color={colors.signal} />
            <Text style={styles.gridLabel}>
              Hours
            </Text>
            <Text style={styles.gridValue}>
              {post.when}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Ionicons name="navigate-outline" size={16} color={colors.signal} />
            <Text style={styles.gridLabel}>
              Distance
            </Text>
            <Text style={styles.gridValue}>
              {post.distanceKm} km away
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onNavigate}
          style={({ pressed }) => [
            styles.navigateBtn,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="navigate"
            size={16}
            color={colors.signalForeground}
          />
          <Text style={styles.navigateBtnText}>
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
  headerMeta: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
    color: colors.muted,
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
    color: colors.textSecondary,
  },
  grid: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  gridLabel: {
    fontSize: 12,
    width: 65,
    color: colors.muted,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    color: colors.text,
  },
  navigateBtn: {
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    backgroundColor: colors.signal,
  },
  pressed: {
    opacity: 0.85,
  },
  navigateBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.signalForeground,
  },
});

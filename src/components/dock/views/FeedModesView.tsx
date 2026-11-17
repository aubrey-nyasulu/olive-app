import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOlive, type FeedMode } from "../../../context/OliveProvider";

const FEED_MODE_OPTIONS = [
  {
    icon: "layers" as const,
    label: "All Activity",
    desc: "Both people & places",
    mode: "all" as const,
  },
  {
    icon: "people" as const,
    label: "People Only",
    desc: "Guides, locals & community members",
    mode: "people" as const,
  },
  {
    icon: "business" as const,
    label: "Places & Events",
    desc: "Businesses, venues & session drops",
    mode: "places" as const,
  },
];

interface FeedModesViewProps {
  onSelectMode: (mode: FeedMode) => void;
}

export function FeedModesView({ onSelectMode }: FeedModesViewProps) {
  const { colors, feedMode } = useOlive();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Select Feed Mode
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Filter the content shown on your home feed
        </Text>
      </View>

      <View style={styles.optionsWrap}>
        {FEED_MODE_OPTIONS.map(({ icon, label, desc, mode }) => {
          const isSelected = feedMode === mode;
          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label}`}
              onPress={() => onSelectMode(mode)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: isSelected
                    ? colors.signalLight
                    : colors.surfaceMuted,
                  borderColor: isSelected ? colors.signal : colors.line,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isSelected
                      ? colors.signal
                      : colors.surface,
                  },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={isSelected ? colors.signalForeground : colors.text}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isSelected ? colors.signal : colors.text,
                      fontWeight: isSelected ? "700" : "600",
                    },
                  ]}
                >
                  {label}
                </Text>
                <Text style={[styles.desc, { color: colors.muted }]}>
                  {desc}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.signal}
                />
              )}
            </Pressable>
          );
        })}
      </View>
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
  optionsWrap: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
  },
  desc: {
    fontSize: 11.5,
    marginTop: 1,
  },
});

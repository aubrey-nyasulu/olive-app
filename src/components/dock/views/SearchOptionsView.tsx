import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SearchMode } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";

const SEARCH_OPTIONS = [
  {
    icon: "mic" as const,
    label: "Voice",
    mode: "voice" as const,
    desc: "Acoustic speech intake",
  },
  {
    icon: "keypad" as const,
    label: "Type",
    mode: "type" as const,
    desc: "Keywords, places & categories",
  },
  {
    icon: "camera" as const,
    label: "Visual",
    mode: "visual" as const,
    desc: "Point camera or scan surroundings",
  },
];

interface SearchOptionsViewProps {
  onToggleSync: () => void;
  onSelectSearchMode: (mode: SearchMode) => void;
}

export function SearchOptionsView({
  onToggleSync,
  onSelectSearchMode,
}: SearchOptionsViewProps) {
  const { colors, isScanning } = useOlive();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Search & Stream Controls
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Toggle realtime sync or launch search
        </Text>
      </View>

      <View style={styles.optionsWrap}>
        {/* Realtime Stream Toggle Card */}
        <Pressable
          accessibilityRole="button"
          onPress={onToggleSync}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: isScanning
                ? colors.signalLight
                : colors.surfaceMuted,
              borderColor: isScanning ? colors.signal : colors.line,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isScanning
                  ? colors.signal
                  : colors.surface,
              },
            ]}
          >
            <Ionicons
              name={isScanning ? "radio" : "radio-outline"}
              size={20}
              color={isScanning ? colors.signalForeground : colors.text}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.label,
                {
                  color: isScanning ? colors.signal : colors.text,
                  fontWeight: isScanning ? "700" : "600",
                },
              ]}
            >
              {isScanning ? "Live Feed Sync: Active" : "Live Feed Sync: Paused"}
            </Text>
            <Text style={[styles.desc, { color: colors.muted }]}>
              {isScanning ? "Realtime stream active" : "Tap to stream live"}
            </Text>
          </View>
          <View
            style={[
              styles.dot,
              { backgroundColor: isScanning ? colors.signal : colors.muted },
            ]}
          />
        </Pressable>

        {/* Search Modes */}
        {SEARCH_OPTIONS.map(({ icon, label, mode, desc }) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            onPress={() => onSelectSearchMode(mode)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: colors.surface }]}
            >
              <Ionicons name={icon} size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.text }]}>
                {label} Search
              </Text>
              <Text style={[styles.desc, { color: colors.muted }]}>
                {desc}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.muted} />
          </Pressable>
        ))}
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

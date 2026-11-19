import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SearchMode } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";
import { colors } from "../../../constants/colors";

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
  const { isScanning } = useOlive();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Search & Stream Controls
        </Text>
        <Text style={styles.subtitle}>
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
            isScanning ? styles.cardActive : styles.cardDefault,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              isScanning ? styles.iconCircleActive : styles.iconCircleDefault,
            ]}
          >
            <Ionicons
              name={isScanning ? "radio" : "radio-outline"}
              size={24}
              color={isScanning ? colors.signalForeground : colors.text}
            />
          </View>
          <View style={styles.metaCol}>
            <Text
              style={[
                styles.label,
                isScanning ? styles.labelActive : styles.labelDefault,
              ]}
            >
              {isScanning ? "Live Feed Sync: Active" : "Live Feed Sync: Paused"}
            </Text>
            <Text style={styles.desc}>
              {isScanning ? "Realtime stream active" : "Tap to stream live"}
            </Text>
          </View>
          <View
            style={[
              styles.dot,
              isScanning ? styles.dotActive : styles.dotInactive,
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
              styles.cardDefault,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconCircle, styles.iconCircleDefault]}>
              <Ionicons name={icon} size={24} color={colors.text} />
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.label}>
                {label} Search
              </Text>
              <Text style={styles.desc}>{desc}</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
  optionsWrap: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingRight: 12,
    borderRadius: 32,
    borderWidth: 1,
    gap: 12,
  },
  cardDefault: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  cardActive: {
    backgroundColor: colors.signalLight,
    borderColor: colors.signal,
  },
  pressed: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleDefault: {
    backgroundColor: colors.surface,
  },
  iconCircleActive: {
    backgroundColor: colors.signal,
  },
  metaCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  labelDefault: {
    color: colors.text,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.signal,
    fontWeight: "700",
  },
  desc: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.signal,
  },
  dotInactive: {
    backgroundColor: colors.muted,
  },
});

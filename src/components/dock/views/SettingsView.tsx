import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { CATEGORIES } from "../../../places";
import type { TravelMode } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";
import { colors } from "../../../constants/colors";

const RADII = [1, 2, 5, 10, 20];
const MODES: { key: TravelMode; label: string }[] = [
  { key: "walking", label: "Walking" },
  { key: "cycling", label: "Cycling" },
  { key: "driving", label: "Driving" },
];

export function SettingsView() {
  const { config, updateSettings, resetSettings } = useOlive();

  const handleToggleLane = (cat: string) => {
    const active = config.lanes.includes(cat);
    const nextLanes = active
      ? config.lanes.filter((l) => l !== cat)
      : [...config.lanes, cat];
    updateSettings({ lanes: nextLanes });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Preferences & Filters
        </Text>
        <Text style={styles.subtitle}>
          Discovery radius, transport modes, and alerts
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Radius */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Search Radius
          </Text>
          <Text style={styles.sectionHint}>
            How far Olive looks when exploring nearby
          </Text>
          <View style={styles.pillsRow}>
            {RADII.map((r) => {
              const active = config.radiusKm === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => updateSettings({ radiusKm: r })}
                  style={[
                    styles.pill,
                    active ? styles.pillActive : styles.pillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      active ? styles.pillTextActive : styles.pillTextInactive,
                    ]}
                  >
                    {r} km
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Categories / Lanes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Categories
          </Text>
          <Text style={styles.sectionHint}>
            Prioritize specific categories in your feed
          </Text>
          <View style={styles.pillsRow}>
            {CATEGORIES.map((cat) => {
              const active = config.lanes.includes(cat);
              return (
                <Pressable
                  key={cat}
                  onPress={() => handleToggleLane(cat)}
                  style={[
                    styles.pill,
                    active ? styles.pillActive : styles.pillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      active ? styles.pillTextActive : styles.pillTextInactive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Getting Around / Modes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Getting Around
          </Text>
          <View style={styles.pillsRow}>
            {MODES.map(({ key, label }) => {
              const active = config.mode === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => updateSettings({ mode: key })}
                  style={[
                    styles.pill,
                    active ? styles.pillActive : styles.pillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      active ? styles.pillTextActive : styles.pillTextInactive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Toggles */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleMeta}>
            <Text style={styles.toggleTitle}>
              Dark Theme
            </Text>
            <Text style={styles.toggleSub}>
              High-contrast night palette
            </Text>
          </View>
          <Switch
            value={config.dark}
            onValueChange={(val) => updateSettings({ dark: val })}
            trackColor={{ false: colors.line, true: colors.signal }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleMeta}>
            <Text style={styles.toggleTitle}>
              Push Alerts
            </Text>
            <Text style={styles.toggleSub}>
              Notifications when within walking radius
            </Text>
          </View>
          <Switch
            value={config.alerts}
            onValueChange={(val) => updateSettings({ alerts: val })}
            trackColor={{ false: colors.line, true: colors.signal }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Pressable onPress={resetSettings} style={styles.resetBtn}>
          <Text style={styles.resetText}>
            Reset to defaults
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  section: {
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 4,
    color: colors.muted,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  pillActive: {
    backgroundColor: colors.signal,
    borderColor: colors.signal,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pillTextInactive: {
    color: colors.text,
  },
  pillTextActive: {
    color: colors.signalForeground,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  toggleMeta: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
  resetBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  resetText: {
    fontSize: 12,
    textDecorationLine: "underline",
    color: colors.muted,
  },
});

import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { CATEGORIES } from "../../../places";
import type { TravelMode } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";

const RADII = [1, 2, 5, 10, 20];
const MODES: { key: TravelMode; label: string }[] = [
  { key: "walking", label: "Walking" },
  { key: "cycling", label: "Cycling" },
  { key: "driving", label: "Driving" },
];

export function SettingsView() {
  const { colors, config, updateSettings, resetSettings } = useOlive();

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
        <Text style={[styles.title, { color: colors.text }]}>
          Preferences & Filters
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Search Radius
          </Text>
          <Text style={[styles.sectionHint, { color: colors.muted }]}>
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
                    {
                      backgroundColor: active ? colors.signal : colors.surfaceMuted,
                      borderColor: active ? colors.signal : colors.line,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: active ? colors.signalForeground : colors.text },
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Categories
          </Text>
          <Text style={[styles.sectionHint, { color: colors.muted }]}>
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
                    {
                      backgroundColor: active ? colors.signal : colors.surfaceMuted,
                      borderColor: active ? colors.signal : colors.line,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: active ? colors.signalForeground : colors.text },
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
                    {
                      backgroundColor: active ? colors.signal : colors.surfaceMuted,
                      borderColor: active ? colors.signal : colors.line,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: active ? colors.signalForeground : colors.text },
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
        <View
          style={[
            styles.toggleCard,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              Dark Theme
            </Text>
            <Text style={[styles.toggleSub, { color: colors.muted }]}>
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

        <View
          style={[
            styles.toggleCard,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              Push Alerts
            </Text>
            <Text style={[styles.toggleSub, { color: colors.muted }]}>
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
          <Text style={[styles.resetText, { color: colors.muted }]}>
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
  section: {
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  sectionHint: {
    fontSize: 11.5,
    marginBottom: 4,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 2,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 1,
  },
  resetBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  resetText: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
});

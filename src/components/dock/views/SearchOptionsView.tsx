import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  Camera,
  ChevronRight,
  Grid3x3,
  Mic,
  Radio,
} from "lucide-react-native";
import type { SearchMode } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface SearchOption {
  icon: LucideIcon;
  label: string;
  mode: SearchMode;
  desc: string;
}

const SEARCH_OPTIONS: SearchOption[] = [
  {
    icon: Mic,
    label: "Voice",
    mode: "voice",
    desc: "Acoustic speech intake",
  },
  {
    icon: Grid3x3,
    label: "Type",
    mode: "type",
    desc: "Keywords, places & categories",
  },
  {
    icon: Camera,
    label: "Visual",
    mode: "visual",
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
  const { styles, colors } = useThemeStyles(createStyles);
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.optionsWrap}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
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
            <Radio
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
        {SEARCH_OPTIONS.map(({ icon, label, mode, desc }) => {
          const Icon = icon;
          return (
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
                <Icon size={24} color={colors.text} />
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.label}>
                  {label} Search
                </Text>
                <Text style={styles.desc}>{desc}</Text>
              </View>
              <ChevronRight size={17} color={colors.muted} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scroll: {
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
      paddingBottom: 110,
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

import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Building2, CheckCircle2, Layers, Users } from "lucide-react-native";
import { useOlive, type FeedMode } from "../../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface FeedModeOption {
  icon: LucideIcon;
  label: string;
  desc: string;
  mode: FeedMode;
}

const FEED_MODE_OPTIONS: FeedModeOption[] = [
  {
    icon: Layers,
    label: "Show Everything",
    desc: "All activity from both users & businesses",
    mode: "all",
  },
  {
    icon: Users,
    label: "Users Only",
    desc: "Guides, locals & community members",
    mode: "people",
  },
  {
    icon: Building2,
    label: "Businesses & Places",
    desc: "Bakeries, cafes, venues & session drops",
    mode: "places",
  },
];

interface FeedModesViewProps {
  onSelectMode: (mode: FeedMode) => void;
}

export function FeedModesView({ onSelectMode }: FeedModesViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { feedMode } = useOlive();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Filter Feed Content
        </Text>
        <Text style={styles.subtitle}>
          Choose whether to show drops from users, businesses, or everything
        </Text>
      </View>

      <View style={styles.optionsWrap}>
        {FEED_MODE_OPTIONS.map(({ icon, label, desc, mode }) => {
          const isSelected = feedMode === mode;
          const Icon = icon;
          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label}`}
              onPress={() => onSelectMode(mode)}
              style={({ pressed }) => [
                styles.card,
                isSelected ? styles.cardSelected : styles.cardDefault,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  isSelected ? styles.iconCircleSelected : styles.iconCircleDefault,
                ]}
              >
                <Icon
                  size={20}
                  color={isSelected ? colors.signalForeground : colors.text}
                />
              </View>
              <View style={styles.textMeta}>
                <Text
                  style={[
                    styles.label,
                    isSelected && styles.labelSelected,
                  ]}
                >
                  {label}
                </Text>
                <Text style={styles.desc}>
                  {desc}
                </Text>
              </View>
              {isSelected && (
                <CheckCircle2
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

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
    paddingBottom: 88,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 32,
    borderWidth: 1,
    gap: 12,
  },
  cardDefault: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  cardSelected: {
    backgroundColor: colors.signalLight,
    borderColor: colors.signal,
  },
  pressed: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleDefault: {
    backgroundColor: colors.surface,
  },
  iconCircleSelected: {
    backgroundColor: colors.signal,
  },
  textMeta: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  labelSelected: {
    color: colors.signal,
    fontWeight: "700",
  },
  desc: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
});

import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

type PillProps = {
  active: boolean;
  onPress: () => void;
  label: string;
};

export function Pill({ active, onPress, label }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active ? styles.pillActive : styles.pillInactive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pillInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  pillActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    fontSize: 14,
  },
  textInactive: {
    color: colors.muted,
    fontWeight: "500",
  },
  textActive: {
    color: colors.bg,
    fontWeight: "700",
  },
});

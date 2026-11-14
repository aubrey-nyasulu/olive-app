import { Pressable, StyleSheet, Text } from "react-native";
import { useOlive } from "../context/OliveProvider";

type PillProps = {
  active: boolean;
  onPress: () => void;
  label: string;
};

export function Pill({ active, onPress, label }: PillProps) {
  const { colors } = useOlive();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? colors.text : colors.surface,
          borderColor: active ? colors.text : colors.line,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: active ? colors.bg : colors.muted,
            fontWeight: active ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
  },
});

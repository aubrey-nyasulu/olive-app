import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { UserProfile } from "../../../profiles";
import { colors } from "../../../constants/colors";

const REPORT_REASONS = [
  "Incorrect venue location or business hours",
  "Misleading or fraudulent drops",
  "Inappropriate or offensive content",
  "Permanently closed venue",
];

interface ReportViewProps {
  targetUser: UserProfile;
  onSubmitReport: (reason: string) => void;
}

export function ReportView({ targetUser, onSubmitReport }: ReportViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Report Account
        </Text>
        <Text style={styles.subtitle}>
          {targetUser.handle}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {REPORT_REASONS.map((reason) => (
          <Pressable
            key={reason}
            onPress={() => onSubmitReport(reason)}
            style={({ pressed }) => [
              styles.reasonRow,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.reasonText}>
              {reason}
            </Text>
            <Ionicons name="chevron-forward" size={15} color={colors.muted} />
          </Pressable>
        ))}
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
    gap: 8,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.75,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    color: colors.text,
  },
});

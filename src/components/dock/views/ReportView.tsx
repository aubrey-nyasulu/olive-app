import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { UserProfile } from "../../../profiles";
import { useOlive } from "../../../context/OliveProvider";

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
  const { colors } = useOlive();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Report Account
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
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
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.reasonText, { color: colors.text }]}>
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
    gap: 8,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
});

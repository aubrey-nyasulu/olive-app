import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { UserProfile } from "../../../profiles";
import { useThemeStyles, type ColorPalette } from "../../../theme";

const REPORT_REASONS = [
  "Incorrect venue location or business hours",
  "Misleading or fraudulent drops",
  "Inappropriate or offensive content",
  "Permanently closed venue",
];

interface ReportViewProps {
  targetUser: UserProfile;
  onSubmitReport: (reason: string) => void;
  hideHeader?: boolean;
}

export function ReportView({
  targetUser,
  onSubmitReport,
  hideHeader = false,
}: ReportViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>
            Report Account
          </Text>
          <Text style={styles.subtitle}>
            {targetUser.handle}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          hideHeader && { paddingTop: 14, paddingBottom: 20 },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
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
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
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

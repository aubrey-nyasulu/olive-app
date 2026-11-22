import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import type { UserProfile } from "../../../profiles";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface MessageViewProps {
  recipient: UserProfile;
}

export function MessageView({ recipient }: MessageViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.recipientRow}>
          <Image source={recipient.avatar} style={styles.avatar} />
          <View>
            <Text style={styles.title}>
              Message {recipient.name}
            </Text>
            <Text style={styles.subtitle}>
              {recipient.handle} · {recipient.neighborhood}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hintCard}>
          <Sparkles size={16} color={colors.signal} />
          <Text style={styles.hintText}>
            Ask about opening hours, table bookings, batch availability, or send a note to {recipient.name}.
          </Text>
        </View>
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
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingBottom: 88,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    color: colors.textSecondary,
  },
});

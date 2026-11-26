import { useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Send, Sparkles } from "lucide-react-native";
import type { UserProfile } from "../../../profiles";
import { useOlive } from "../../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface MessageViewProps {
  recipient: UserProfile;
  hideHeader?: boolean;
  showComposer?: boolean;
  onSent?: () => void;
}

export function MessageView({
  recipient,
  hideHeader = false,
  showComposer = false,
  onSent,
}: MessageViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { showToast } = useOlive();
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setDraft("");
    Keyboard.dismiss();
    showToast(`Message sent to ${recipient.name}`);
    onSent?.();
  };

  return (
    <View style={styles.container}>
      {!hideHeader && (
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
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          showComposer && styles.scrollContentComposer,
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {hideHeader && (
          <View style={styles.popupRecipientCard}>
            <Image source={recipient.avatar} style={styles.avatar} />
            <View style={styles.popupRecipientMeta}>
              <Text style={styles.popupRecipientName}>{recipient.name}</Text>
              <Text style={styles.subtitle}>
                {recipient.handle} · {recipient.neighborhood}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.hintCard}>
          <Sparkles size={16} color={colors.signal} />
          <Text style={styles.hintText}>
            Ask about opening hours, table bookings, batch availability, or send a note to {recipient.name}.
          </Text>
        </View>
      </ScrollView>

      {showComposer && (
        <View style={styles.composerBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${recipient.name}...`}
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            style={styles.composerInput}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim()}
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendBtn,
              draft.trim() ? styles.sendBtnActive : styles.sendBtnInactive,
              pressed && draft.trim() && styles.pressed,
            ]}
          >
            <Send
              size={16}
              color={draft.trim() ? colors.signalForeground : colors.muted}
            />
          </Pressable>
        </View>
      )}
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
    paddingBottom: 110,
  },
  scrollContentComposer: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  popupRecipientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceMuted,
  },
  popupRecipientMeta: {
    flex: 1,
  },
  popupRecipientName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  composerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  composerInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: colors.signal,
  },
  sendBtnInactive: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.75,
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

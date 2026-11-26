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
import { ArrowUp, MessageSquareMore, Star } from "lucide-react-native";
import type { Post, Review } from "../../../models";
import { useOlive } from "../../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../../theme";

const userAvatar = require("../../../../assets/images/profile-avatar.jpg");

interface CommentsViewProps {
  post: Post;
  reviews: Review[];
  hideHeader?: boolean;
  showComposer?: boolean;
}

export function CommentsView({
  post,
  reviews,
  hideHeader = false,
  showComposer = false,
}: CommentsViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { addReview, showToast } = useOlive();
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addReview(post.id, {
      by: "Chisomo Banda",
      stars: 5,
      text: trimmed,
    });
    setDraft("");
    Keyboard.dismiss();
    showToast(`Review added for ${post.author}`);
  };

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <View style={styles.headerMeta}>
            <Text style={styles.title}>Reviews & Comments</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {post.author} · {post.place}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {reviews.length} {reviews.length === 1 ? "note" : "notes"}
            </Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageSquareMore size={36} color={colors.muted} />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to visit and share your experience below.
            </Text>
          </View>
        ) : (
          reviews.map((rev, idx) => (
            <View key={`${rev.by}-${idx}`} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={styles.avatarCircle}>
                  {rev.by === "Chisomo Banda" ? (
                    <Image source={userAvatar} style={styles.avatarPhoto} />
                  ) : (
                    <Text style={styles.avatarLetter}>{rev.by[0]}</Text>
                  )}
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.authorName}>{rev.by}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        color={colors.signal}
                        fill={colors.signal}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{rev.text}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {showComposer && (
        <View style={styles.composerBar}>
          <View style={styles.composerAvatarWrap}>
            <Image source={userAvatar} style={styles.avatarPhoto} />
          </View>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a review or note..."
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            style={styles.composerInput}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send review"
            disabled={!draft.trim()}
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendBtn,
              draft.trim() ? styles.sendBtnActive : styles.sendBtnInactive,
              pressed && draft.trim() && styles.pressed,
            ]}
          >
            <ArrowUp
              size={18}
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 8,
    },
    headerMeta: {
      flex: 1,
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
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.signal,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 88,
      gap: 8,
    },
    scrollContentComposer: {
      paddingTop: 12,
      paddingBottom: 16,
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
    composerAvatarWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      overflow: "hidden",
      borderWidth: 1.5,
      borderColor: colors.signal,
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
    emptyContainer: {
      paddingVertical: 36,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: 12,
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 18,
      color: colors.muted,
    },
    reviewCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 12,
      gap: 8,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    reviewTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    avatarCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    avatarPhoto: {
      width: "100%",
      height: "100%",
    },
    avatarLetter: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    reviewMeta: {
      flex: 1,
    },
    authorName: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    starsRow: {
      flexDirection: "row",
      gap: 2,
      marginTop: 2,
    },
    reviewText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
  });

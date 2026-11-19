import { Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ExpandedWindow } from "../../context/OliveProvider";
import { useOlive } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { DockWaveform } from "./DockWaveform";

const userAvatar = require("../../../assets/images/profile-avatar.jpg");

interface DockActionBarProps {
  isExpanded: boolean;
  expandedWindow: ExpandedWindow;
  showAnimatingLine: boolean;
  onFeed: boolean;
  onProfile: boolean;
  panelOpen: boolean;
  searchOpen: boolean;
  profileMenuOpen: boolean;
  isListening: boolean;
  isOtherUser: boolean;
  commentDraft: string;
  setCommentDraft: (text: string) => void;
  messageDraft: string;
  setMessageDraft: (text: string) => void;
  savedCount?: number;
  onSendComment: () => void;
  onSendMessage: () => void;
  onCloseExpanded: () => void;
  onToggleSearch: () => void;
  onRightLongPress: () => void;
  onLeftPill: () => void;
  onLeftLongPress: () => void;
  onToggleListening: () => void;
  onDoneExpanded?: () => void;
}

export function DockActionBar({
  isExpanded,
  expandedWindow,
  showAnimatingLine,
  onProfile,
  isOtherUser,
  profileMenuOpen,
  panelOpen,
  searchOpen,
  isListening,
  commentDraft,
  setCommentDraft,
  messageDraft,
  setMessageDraft,
  onSendComment,
  onSendMessage,
  onCloseExpanded,
  onToggleSearch,
  onRightLongPress,
  onLeftPill,
  onLeftLongPress,
  onToggleListening,
}: DockActionBarProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { activeMode, typeQuery, setTypeQuery, setIsSearching } = useOlive();

  const isComments = expandedWindow?.type === "comments";
  const isMessage = expandedWindow?.type === "message";
  const isInputMode = isComments || isMessage;

  return (
    <View style={styles.bar}>
      {/* LEFT BUTTON SLOT */}
      <View style={styles.slotLeft}>
        {isInputMode ? (
          <View
            style={[
              styles.avatarButtonCircle,
              styles.avatarButtonCircleInputMode,
            ]}
          >
            <Image source={userAvatar} style={styles.dockAvatarImg} />
          </View>
        ) : expandedWindow?.type === "user_menu" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search and stream controls"
            onPress={onLeftPill}
            style={({ pressed }) => [
              styles.sideBtn,
              styles.sideBtnMuted,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="search" size={20} color={colors.text} />
          </Pressable>
        ) : isExpanded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={onCloseExpanded}
            style={({ pressed }) => [
              styles.sideBtn,
              styles.sideBtnMuted,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              panelOpen || searchOpen
                ? "Cancel search"
                : onProfile
                ? "Back to feed"
                : "Search and stream controls"
            }
            onPress={onLeftPill}
            onLongPress={onLeftLongPress}
            delayLongPress={320}
            style={({ pressed }) => [
              styles.sideBtn,
              panelOpen || searchOpen ? styles.sideBtnSignal : styles.sideBtnBg,
              pressed && styles.pressed,
            ]}
          >
            {panelOpen || searchOpen ? (
              <Ionicons
                name="close"
                size={20}
                color={colors.signalForeground}
              />
            ) : onProfile ? (
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            ) : (
              <Ionicons name="search" size={20} color={colors.text} />
            )}
          </Pressable>
        )}
      </View>

      {/* CENTER SLOT */}
      <View style={styles.slotCenter}>
        {isComments ? (
          <TextInput
            value={commentDraft}
            onChangeText={setCommentDraft}
            placeholder="Add a review or note..."
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            onSubmitEditing={onSendComment}
            style={styles.expandedInput}
          />
        ) : isMessage && expandedWindow?.type === "message" ? (
          <TextInput
            value={messageDraft}
            onChangeText={setMessageDraft}
            placeholder={`Message ${expandedWindow.recipient.name}...`}
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            onSubmitEditing={onSendMessage}
            style={styles.expandedInput}
          />
        ) : isExpanded ? (
          <View style={styles.centerSpacer} />
        ) : activeMode === "type" ? (
          <TextInput
            autoFocus
            value={typeQuery}
            onChangeText={setTypeQuery}
            placeholder="Search places, people & drops..."
            placeholderTextColor="rgba(255, 255, 255, 0.45)"
            returnKeyType="search"
            onSubmitEditing={() => {
              if (typeQuery.trim()) {
                setIsSearching(true);
                setTimeout(() => setIsSearching(false), 1800);
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        ) : showAnimatingLine ? (
          <DockWaveform
            showAnimatingLine={showAnimatingLine}
            isVoice={activeMode === "voice"}
            isListening={isListening}
            onToggleListening={onToggleListening}
          />
        ) : (
          <View style={styles.restingPill} />
        )}
      </View>

      {/* RIGHT BUTTON SLOT */}
      <View style={styles.slotRight}>
        {isComments ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send comment"
            onPress={onSendComment}
            style={({ pressed }) => [
              styles.sideBtn,
              commentDraft.trim() ? styles.sideBtnSignal : styles.sideBtnMuted,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={
                commentDraft.trim() ? colors.signalForeground : colors.muted
              }
            />
          </Pressable>
        ) : isMessage ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={onSendMessage}
            style={({ pressed }) => [
              styles.sideBtn,
              messageDraft.trim() ? styles.sideBtnSignal : styles.sideBtnMuted,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={
                messageDraft.trim() ? colors.signalForeground : colors.muted
              }
            />
          </Pressable>
        ) : expandedWindow?.type === "user_menu" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={onCloseExpanded}
            style={({ pressed }) => [
              styles.sideBtn,
              styles.sideBtnMuted,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        ) : isExpanded ? (
          onProfile && isOtherUser ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile options"
              onPress={onToggleSearch}
              style={({ pressed }) => [
                styles.sideBtn,
                styles.sideBtnMuted,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="chevron-up" size={22} color={colors.text} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Account and options"
              onPress={onToggleSearch}
              onLongPress={onRightLongPress}
              delayLongPress={320}
              style={({ pressed }) => [
                styles.sideBtn,
                styles.sideBtnTransparent,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.avatarButtonCircle}>
                <Image source={userAvatar} style={styles.dockAvatarImg} />
              </View>
            </Pressable>
          )
        ) : panelOpen ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search actions"
            onPress={onToggleSearch}
            style={({ pressed }) => [
              styles.sideBtn,
              styles.sideBtnSignal,
              pressed && styles.pressed,
            ]}
          >
            {activeMode === "voice" ? (
              <Ionicons
                name={isListening ? "mic" : "mic-outline"}
                size={20}
                color={colors.signalForeground}
              />
            ) : activeMode === "type" ? (
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.signalForeground}
              />
            ) : (
              <Ionicons
                name="close"
                size={20}
                color={colors.signalForeground}
              />
            )}
          </Pressable>
        ) : onProfile && isOtherUser ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              profileMenuOpen ? "Close options" : "Profile options"
            }
            onPress={onToggleSearch}
            style={({ pressed }) => [
              styles.sideBtn,
              profileMenuOpen ? styles.sideBtnSignal : styles.sideBtnBg,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={profileMenuOpen ? "close" : "chevron-up"}
              size={profileMenuOpen ? 20 : 22}
              color={profileMenuOpen ? colors.signalForeground : colors.text}
            />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account and options"
            onPress={onToggleSearch}
            onLongPress={onRightLongPress}
            delayLongPress={320}
            style={({ pressed }) => [
              styles.sideBtn,
              styles.sideBtnTransparent,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.avatarButtonCircle}>
              <Image source={userAvatar} style={styles.dockAvatarImg} />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    bar: {
      width: "100%",
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 8,
    },
    slotLeft: {
      alignItems: "center",
      justifyContent: "center",
    },
    slotCenter: {
      flex: 1,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    slotRight: {
      alignItems: "flex-end",
      justifyContent: "center",
    },
    centerSpacer: {
      flex: 1,
    },
    sideBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    sideBtnMuted: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
      borderWidth: 1,
    },
    sideBtnSignal: {
      backgroundColor: colors.signal,
    },
    sideBtnBg: {
      backgroundColor: colors.bg,
    },
    sideBtnTransparent: {
      backgroundColor: "transparent",
    },
    pressed: {
      opacity: 0.75,
    },
    avatarButtonCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 0,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    avatarButtonCircleInputMode: {
      borderWidth: 2,
      borderColor: colors.signal,
    },
    dockAvatarImg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    expandedInput: {
      height: 44,
      borderRadius: 22,
      paddingHorizontal: 16,
      fontSize: 14,
      borderWidth: 1,
      color: colors.text,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    input: {
      fontSize: 14,
      fontWeight: "500",
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.signal,
      color: colors.bg,
    },
    restingPill: {
      opacity: 0,
      width: "100%",
      height: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      alignSelf: "center",
    },
  });

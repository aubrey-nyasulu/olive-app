import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ExpandedWindow } from "../../context/OliveProvider";
import { useOlive } from "../../context/OliveProvider";
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
  savedCount: number;
  onSendComment: () => void;
  onSendMessage: () => void;
  onCloseExpanded: () => void;
  onToggleSearch: () => void;
  onRightLongPress: () => void;
  onLeftPill: () => void;
  onLeftLongPress: () => void;
  onToggleListening: () => void;
  onDoneExpanded: () => void;
}

const getMenuTitleInfo = (
  type?: string
): {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
} => {
  switch (type) {
    case "search_options":
      return { title: "Search and Stream controls", icon: "radio" };
    case "user_menu":
      return { title: "Account and Options", icon: "person-circle" };
    case "feed_modes":
      return { title: "Feed Filter", icon: "filter" };
    case "profile_saved":
      return { title: "Saved Places", icon: "bookmark" };
    case "profile_settings":
      return { title: "Preferences", icon: "options" };
    case "details":
      return { title: "Place Details", icon: "location" };
    case "related":
      return { title: "Similar Nearby", icon: "compass" };
    case "report":
      return { title: "Report Account", icon: "flag" };
    case "notifications":
      return { title: "Notifications", icon: "notifications" };
    default:
      return { title: "Menu", icon: "sparkles" };
  }
};

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
  const { colors, activeMode, typeQuery, setTypeQuery, setIsSearching } =
    useOlive();

  const isComments = expandedWindow?.type === "comments";
  const isMessage = expandedWindow?.type === "message";
  const isInputMode = isComments || isMessage;

  const menuInfo = getMenuTitleInfo(expandedWindow?.type);

  return (
    <View style={[styles.bar, { height: isExpanded ? 64 : "100%" }]}>
      {/* LEFT BUTTON SLOT */}
      <View style={styles.slotLeft}>
        {isInputMode ? (
          <View
            style={[
              styles.avatarButtonCircle,
              { borderColor: colors.signal, backgroundColor: colors.surface },
            ]}
          >
            <Image source={userAvatar} style={styles.dockAvatarImg} />
          </View>
        ) : isExpanded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={onCloseExpanded}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
                borderWidth: 1,
                opacity: pressed ? 0.75 : 1,
              },
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
              {
                backgroundColor:
                  panelOpen || searchOpen ? colors.signal : colors.bg,
                opacity: pressed ? 0.75 : 1,
              },
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
            style={[
              styles.expandedInput,
              {
                color: colors.text,
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
              },
            ]}
          />
        ) : isMessage && expandedWindow?.type === "message" ? (
          <TextInput
            value={messageDraft}
            onChangeText={setMessageDraft}
            placeholder={`Message ${expandedWindow.recipient.name}...`}
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            onSubmitEditing={onSendMessage}
            style={[
              styles.expandedInput,
              {
                color: colors.text,
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
              },
            ]}
          />
        ) : isExpanded ? (
          // Middle text element removed for menus; empty flexible spacer
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
            style={[styles.input, { color: colors.bg }]}
          />
        ) : showAnimatingLine ? (
          <DockWaveform
            showAnimatingLine={showAnimatingLine}
            isVoice={activeMode === "voice"}
            isListening={isListening}
            onToggleListening={onToggleListening}
          />
        ) : (
          <View style={styles.restingPill}></View>
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
              {
                backgroundColor: commentDraft.trim()
                  ? colors.signal
                  : colors.surfaceMuted,
                opacity: pressed ? 0.75 : 1,
              },
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
              {
                backgroundColor: messageDraft.trim()
                  ? colors.signal
                  : colors.surfaceMuted,
                opacity: pressed ? 0.75 : 1,
              },
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
        ) : isExpanded ? (
          // Menu title pill replacing checkmark button
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={menuInfo.title}
            onPress={onCloseExpanded}
            style={({ pressed }) => [
              styles.menuTitlePill,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons name={menuInfo.icon} size={15} color={colors.signal} />
            <Text
              numberOfLines={1}
              style={[styles.menuTitleText, { color: colors.text }]}
            >
              {menuInfo.title}
            </Text>
          </Pressable>
        ) : panelOpen ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search actions"
            onPress={onToggleSearch}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: colors.signal,
                opacity: pressed ? 0.75 : 1,
              },
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
          // Visiting another user's profile: show caret for other user profile options
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              profileMenuOpen ? "Close options" : "Profile options"
            }
            onPress={onToggleSearch}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: profileMenuOpen ? colors.signal : colors.bg,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              name={profileMenuOpen ? "close" : "chevron-up"}
              size={profileMenuOpen ? 20 : 22}
              color={profileMenuOpen ? colors.signalForeground : colors.text}
            />
          </Pressable>
        ) : (
          // Collapsed resting profile avatar (feed or own profile)
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account and options"
            onPress={onToggleSearch}
            onLongPress={onRightLongPress}
            delayLongPress={320}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: "transparent",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.avatarButtonCircle,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Image source={userAvatar} style={styles.dockAvatarImg} />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: "100%",
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
  avatarButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  dockAvatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  menuTitlePill: {
    height: 42,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 15,
    borderWidth: 1,
    maxWidth: 240,
  },
  menuTitleText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  expandedInput: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  input: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#FF6326",
  },
  restingPill: {
    opacity: 0,
    width: "100%",
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignSelf: "center",
  },
});

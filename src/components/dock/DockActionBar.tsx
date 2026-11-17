import {
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ExpandedWindow, FeedMode } from "../../context/OliveProvider";
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

export function DockActionBar({
  isExpanded,
  expandedWindow,
  showAnimatingLine,
  onFeed,
  onProfile,
  panelOpen,
  searchOpen,
  profileMenuOpen,
  isListening,
  commentDraft,
  setCommentDraft,
  messageDraft,
  setMessageDraft,
  savedCount,
  onSendComment,
  onSendMessage,
  onCloseExpanded,
  onToggleSearch,
  onRightLongPress,
  onLeftPill,
  onLeftLongPress,
  onToggleListening,
  onDoneExpanded,
}: DockActionBarProps) {
  const {
    colors,
    feedMode,
    isScanning,
    activeMode,
    typeQuery,
    setTypeQuery,
    setIsSearching,
    startGuidance,
  } = useOlive();

  if (isExpanded) {
    const isComments = expandedWindow?.type === "comments";
    const isMessage = expandedWindow?.type === "message";
    const isDetails = expandedWindow?.type === "details";
    const isSaved = expandedWindow?.type === "profile_saved";
    const isSettings = expandedWindow?.type === "profile_settings";

    return (
      <View
        style={[
          styles.bar,
          styles.expandedBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.line,
            borderTopWidth: 1,
          },
        ]}
      >
        {/* Left Button */}
        {isComments || isMessage ? (
          <View style={[styles.avatarCircle, { borderColor: colors.signal }]}>
            <Image source={userAvatar} style={styles.avatarImg} />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onCloseExpanded}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: colors.surfaceMuted,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        )}

        {/* Center Area */}
        <View style={styles.centerArea}>
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
          ) : isDetails && expandedWindow?.type === "details" ? (
            <View
              style={[
                styles.capsule,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              <Ionicons name="location" size={13} color={colors.signal} />
              <Text
                numberOfLines={1}
                style={[styles.capsuleText, { color: colors.text }]}
              >
                {expandedWindow.post.place} · {expandedWindow.post.distanceKm} km
              </Text>
            </View>
          ) : isSaved ? (
            <View
              style={[
                styles.capsule,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              <Ionicons name="bookmark" size={13} color={colors.signal} />
              <Text
                numberOfLines={1}
                style={[styles.capsuleText, { color: colors.text }]}
              >
                {savedCount} {savedCount === 1 ? "Place" : "Places"} Saved
              </Text>
            </View>
          ) : isSettings ? (
            <View
              style={[
                styles.capsule,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              <Ionicons name="options" size={13} color={colors.signal} />
              <Text
                numberOfLines={1}
                style={[styles.capsuleText, { color: colors.text }]}
              >
                Preferences
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.capsule,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              <Ionicons name="sparkles" size={13} color={colors.signal} />
              <Text
                numberOfLines={1}
                style={[styles.capsuleText, { color: colors.text }]}
              >
                Olive
              </Text>
            </View>
          )}
        </View>

        {/* Right Button */}
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
        ) : isDetails && expandedWindow?.type === "details" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Guide me there"
            onPress={() => {
              const p = expandedWindow.post;
              onCloseExpanded();
              startGuidance(p);
            }}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: colors.signal,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              name="navigate"
              size={20}
              color={colors.signalForeground}
            />
          </Pressable>
        ) : isSaved ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share saved places"
            onPress={() => {
              Share.share({
                message: `Check out my saved spots on Olive (${savedCount} places)`,
              });
            }}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: colors.signal,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              name="share-social"
              size={20}
              color={colors.signalForeground}
            />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done"
            onPress={onDoneExpanded}
            style={({ pressed }) => [
              styles.sideBtn,
              {
                backgroundColor: colors.signal,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={colors.signalForeground}
            />
          </Pressable>
        )}
      </View>
    );
  }

  // Resting Mode (Collapsed 64px)
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.text,
          shadowColor: colors.text,
        },
      ]}
    >
      {/* Left Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          panelOpen || searchOpen
            ? "Cancel search"
            : onProfile
            ? "Back"
            : onFeed
            ? `Feed mode: ${feedMode}`
            : "Home"
        }
        onPress={onLeftPill}
        onLongPress={onLeftLongPress}
        delayLongPress={320}
        style={({ pressed }) => [
          styles.sideBtn,
          {
            backgroundColor:
              panelOpen || searchOpen
                ? colors.signal
                : colors.bg,
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
        ) : feedMode === "people" ? (
          <Ionicons name="people" size={20} color={colors.signal} />
        ) : feedMode === "places" ? (
          <Ionicons name="business" size={20} color={colors.signal} />
        ) : (
          <Ionicons name="layers" size={20} color={colors.text} />
        )}
      </Pressable>

      {/* Center Area */}
      <View style={styles.centerArea}>
        {activeMode === "type" ? (
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
          <View style={styles.restingPill}>
            <Ionicons
              name={
                feedMode === "people"
                  ? "people-outline"
                  : feedMode === "places"
                  ? "business-outline"
                  : "sparkles-outline"
              }
              size={13}
              color={colors.signal}
            />
            <Text
              numberOfLines={1}
              style={[styles.restingText, { color: colors.bg }]}
            >
              {feedMode === "people"
                ? "People"
                : feedMode === "places"
                ? "Places & Events"
                : "All Activity"}
            </Text>
          </View>
        )}
      </View>

      {/* Right Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          onProfile
            ? profileMenuOpen
              ? "Close menu"
              : "Options"
            : onFeed
            ? isScanning
              ? "Pause live sync"
              : "Enable live sync"
            : "Search"
        }
        onPress={onToggleSearch}
        onLongPress={onRightLongPress}
        delayLongPress={320}
        style={({ pressed }) => [
          styles.sideBtn,
          {
            backgroundColor: onProfile
              ? profileMenuOpen
                ? colors.signal
                : colors.bg
              : panelOpen || searchOpen
              ? colors.signal
              : onFeed && isScanning
              ? colors.signal
              : colors.bg,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        {onProfile ? (
          <Ionicons
            name={profileMenuOpen ? "close" : "chevron-up"}
            size={profileMenuOpen ? 20 : 22}
            color={profileMenuOpen ? colors.signalForeground : colors.text}
          />
        ) : panelOpen ? (
          activeMode === "voice" ? (
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
          )
        ) : onFeed ? (
          <Ionicons
            name={isScanning ? "radio" : "radio-outline"}
            size={20}
            color={isScanning ? colors.signalForeground : colors.text}
          />
        ) : (
          <Ionicons name="search" size={20} color={colors.signal} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: "100%",
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  expandedBar: {
    height: 64,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  centerArea: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  expandedInput: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  capsule: {
    height: 38,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  capsuleText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  input: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#FF6326",
  },
  restingPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignSelf: "center",
  },
  restingText: {
    fontSize: 12.5,
    fontWeight: "600",
    opacity: 0.9,
  },
});

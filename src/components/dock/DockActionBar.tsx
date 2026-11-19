import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ExpandedWindow } from "../../context/OliveProvider";
import { useOlive } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { DockWaveform } from "./DockWaveform";

const userAvatar = require("../../../assets/images/profile-avatar.jpg");

interface DockActionBarProps {
  expandProgress: Animated.Value;
  isExpanded: boolean;
  expandedWindow: ExpandedWindow;
  renderedWindow: ExpandedWindow;
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
  expandProgress,
  isExpanded,
  expandedWindow,
  renderedWindow,
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

  const activeWin = expandedWindow ?? renderedWindow;
  const isComments = activeWin?.type === "comments";
  const isMessage = activeWin?.type === "message";
  const isInputMode = isComments || isMessage;
  const isUserMenu = activeWin?.type === "user_menu";
  const isWindowActive = activeWin !== null;

  // Continuous interpolation curves tied directly to dockExpandedAnim (height progress)
  // 1. Resting button morph (fades out, scales down, rotates -45deg)
  const restingOpacity = expandProgress.interpolate({
    inputRange: [0, 0.42],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const restingScale = expandProgress.interpolate({
    inputRange: [0, 0.48],
    outputRange: [1, 0.72],
    extrapolate: "clamp",
  });
  const restingRotate = expandProgress.interpolate({
    inputRange: [0, 0.48],
    outputRange: ["0deg", "-45deg"],
    extrapolate: "clamp",
  });

  // 2. Expanded button morph (fades in, scales up to 1, rotates from 45deg to 0deg)
  const expandedOpacity = expandProgress.interpolate({
    inputRange: [0.36, 0.86],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const expandedScale = expandProgress.interpolate({
    inputRange: [0.36, 0.86],
    outputRange: [0.72, 1],
    extrapolate: "clamp",
  });
  const expandedRotate = expandProgress.interpolate({
    inputRange: [0.36, 0.86],
    outputRange: ["45deg", "0deg"],
    extrapolate: "clamp",
  });

  // 3. Center resting waveform / resting pill (fades and scales out as dock expands)
  const centerRestingOpacity = expandProgress.interpolate({
    inputRange: [0, 0.35],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const centerRestingScale = expandProgress.interpolate({
    inputRange: [0, 0.35],
    outputRange: [1, 0.84],
    extrapolate: "clamp",
  });

  // 4. Center input layer (slides up and fades in for review or message drafting)
  const centerInputOpacity = expandProgress.interpolate({
    inputRange: [0.4, 0.9],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const centerInputTranslateY = expandProgress.interpolate({
    inputRange: [0.4, 0.9],
    outputRange: [14, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.bar}>
      {/* LEFT BUTTON SLOT */}
      <View style={styles.slotLeft}>
        {isInputMode ? (
          // Input mode: Search icon morphs into User Avatar relative to dock height
          <>
            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: restingOpacity,
                  transform: [
                    { scale: restingScale },
                    { rotate: restingRotate },
                  ],
                },
              ]}
              pointerEvents={isExpanded ? "none" : "auto"}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search and stream controls"
                onPress={onLeftPill}
                style={({ pressed }) => [
                  styles.sideBtn,
                  styles.sideBtnBg,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="search" size={20} color={colors.text} />
              </Pressable>
            </Animated.View>

            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: expandedOpacity,
                  transform: [{ scale: expandedScale }],
                },
              ]}
              pointerEvents={isExpanded ? "auto" : "none"}
            >
              <View
                style={[
                  styles.avatarButtonCircle,
                  styles.avatarButtonCircleInputMode,
                ]}
              >
                <Image source={userAvatar} style={styles.dockAvatarImg} />
              </View>
            </Animated.View>
          </>
        ) : isUserMenu ? (
          // User Menu: Left button stays Search icon (Right button was the one clicked)
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
        ) : isWindowActive ? (
          // Left button clicked to expand menu: morphs to Close icon relative to height!
          <>
            {/* Resting Button (Search / Back) */}
            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: restingOpacity,
                  transform: [
                    { scale: restingScale },
                    { rotate: restingRotate },
                  ],
                },
              ]}
              pointerEvents={isExpanded ? "none" : "auto"}
            >
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
                  panelOpen || searchOpen
                    ? styles.sideBtnSignal
                    : styles.sideBtnBg,
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
            </Animated.View>

            {/* Expanded Close Button */}
            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: expandedOpacity,
                  transform: [
                    { scale: expandedScale },
                    { rotate: expandedRotate },
                  ],
                },
              ]}
              pointerEvents={isExpanded ? "auto" : "none"}
            >
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
            </Animated.View>
          </>
        ) : (
          // Default Resting State when Dock is completely collapsed
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
              panelOpen || searchOpen
                ? styles.sideBtnSignal
                : styles.sideBtnBg,
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
        {isInputMode ? (
          // Input mode: Waveform smoothly fades out, TextInput smoothly slides up
          <>
            <Animated.View
              style={[
                styles.centerContentLayer,
                {
                  opacity: centerRestingOpacity,
                  transform: [{ scale: centerRestingScale }],
                },
              ]}
              pointerEvents="none"
            >
              {showAnimatingLine ? (
                <DockWaveform
                  showAnimatingLine={showAnimatingLine}
                  isVoice={activeMode === "voice"}
                  isListening={isListening}
                  onToggleListening={onToggleListening}
                />
              ) : (
                <View style={styles.restingPill} />
              )}
            </Animated.View>

            <Animated.View
              style={[
                styles.centerContentLayer,
                {
                  opacity: centerInputOpacity,
                  transform: [{ translateY: centerInputTranslateY }],
                },
              ]}
              pointerEvents={isExpanded ? "auto" : "none"}
            >
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
              ) : isMessage && activeWin?.type === "message" ? (
                <TextInput
                  value={messageDraft}
                  onChangeText={setMessageDraft}
                  placeholder={`Message ${activeWin.recipient.name}...`}
                  placeholderTextColor={colors.muted}
                  returnKeyType="send"
                  onSubmitEditing={onSendMessage}
                  style={styles.expandedInput}
                />
              ) : null}
            </Animated.View>
          </>
        ) : isWindowActive ? (
          // Menu modes: Waveform scales and fades out smoothly with dock height
          <Animated.View
            style={[
              styles.centerContentLayer,
              {
                opacity: centerRestingOpacity,
                transform: [{ scale: centerRestingScale }],
              },
            ]}
            pointerEvents="none"
          >
            {showAnimatingLine ? (
              <DockWaveform
                showAnimatingLine={showAnimatingLine}
                isVoice={activeMode === "voice"}
                isListening={isListening}
                onToggleListening={onToggleListening}
              />
            ) : (
              <View style={styles.restingPill} />
            )}
          </Animated.View>
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
        {isInputMode ? (
          // Input mode: Avatar morphs into Send icon button
          <>
            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: restingOpacity,
                  transform: [
                    { scale: restingScale },
                    { rotate: restingRotate },
                  ],
                },
              ]}
              pointerEvents={isExpanded ? "none" : "auto"}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Account and options"
                onPress={onToggleSearch}
                style={styles.sideBtn}
              >
                <View style={styles.avatarButtonCircle}>
                  <Image source={userAvatar} style={styles.dockAvatarImg} />
                </View>
              </Pressable>
            </Animated.View>

            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: expandedOpacity,
                  transform: [
                    { scale: expandedScale },
                    { rotate: expandedRotate },
                  ],
                },
              ]}
              pointerEvents={isExpanded ? "auto" : "none"}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isComments ? "Send review" : "Send message"}
                onPress={isComments ? onSendComment : onSendMessage}
                style={({ pressed }) => [
                  styles.sideBtn,
                  (isComments ? commentDraft.trim() : messageDraft.trim())
                    ? styles.sideBtnSignal
                    : styles.sideBtnMuted,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={isComments ? "arrow-up" : "send"}
                  size={isComments ? 20 : 18}
                  color={
                    (isComments ? commentDraft.trim() : messageDraft.trim())
                      ? colors.signalForeground
                      : colors.muted
                  }
                />
              </Pressable>
            </Animated.View>
          </>
        ) : isUserMenu ? (
          // User Menu: Right button (Avatar) morphs into Close button relative to height!
          <>
            {/* Resting Avatar Layer */}
            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: restingOpacity,
                  transform: [
                    { scale: restingScale },
                    { rotate: restingRotate },
                  ],
                },
              ]}
              pointerEvents={isExpanded ? "none" : "auto"}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Account and options"
                onPress={onToggleSearch}
                onLongPress={onRightLongPress}
                delayLongPress={320}
                style={styles.sideBtn}
              >
                <View style={styles.avatarButtonCircle}>
                  <Image source={userAvatar} style={styles.dockAvatarImg} />
                </View>
              </Pressable>
            </Animated.View>

            {/* Expanded Close Button Layer */}
            <Animated.View
              style={[
                styles.slotButtonLayer,
                {
                  opacity: expandedOpacity,
                  transform: [
                    { scale: expandedScale },
                    { rotate: expandedRotate },
                  ],
                },
              ]}
              pointerEvents={isExpanded ? "auto" : "none"}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close user menu"
                onPress={onCloseExpanded}
                style={({ pressed }) => [
                  styles.sideBtn,
                  styles.sideBtnMuted,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </Animated.View>
          </>
        ) : isWindowActive ? (
          // Other windows: Right button stays Avatar (Left button morphed to Close)
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
              style={styles.sideBtn}
            >
              <View style={styles.avatarButtonCircle}>
                <Image source={userAvatar} style={styles.dockAvatarImg} />
              </View>
            </Pressable>
          )
        ) : (
          // Standard Resting State when Dock is completely collapsed
          panelOpen ? (
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
              style={styles.sideBtn}
            >
              <View style={styles.avatarButtonCircle}>
                <Image source={userAvatar} style={styles.dockAvatarImg} />
              </View>
            </Pressable>
          )
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
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    slotCenter: {
      flex: 1,
      height: 48,
      paddingHorizontal: 8,
      justifyContent: "center",
      position: "relative",
    },
    slotRight: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    slotButtonLayer: {
      position: "absolute",
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    centerContentLayer: {
      position: "absolute",
      left: 8,
      right: 8,
      height: 48,
      justifyContent: "center",
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

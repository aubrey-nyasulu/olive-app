import { useEffect, useRef } from "react";
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

  // 1. Height-proportional continuous interpolations (tied directly to expandProgress)
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

  // 2. Context-switching continuous spring animations (Screen: Feed <-> Profile, Menu: Closed <-> Open)
  const profileAnim = useRef(new Animated.Value(onProfile ? 1 : 0)).current;
  const otherUserAnim = useRef(new Animated.Value(isOtherUser ? 1 : 0)).current;
  const searchActiveAnim = useRef(
    new Animated.Value(panelOpen || searchOpen ? 1 : 0)
  ).current;
  const profileMenuAnim = useRef(
    new Animated.Value(profileMenuOpen ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.spring(profileAnim, {
      toValue: onProfile ? 1 : 0,
      friction: 9,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [onProfile, profileAnim]);

  useEffect(() => {
    Animated.spring(otherUserAnim, {
      toValue: isOtherUser ? 1 : 0,
      friction: 9,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [isOtherUser, otherUserAnim]);

  useEffect(() => {
    Animated.spring(searchActiveAnim, {
      toValue: panelOpen || searchOpen ? 1 : 0,
      friction: 9,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [panelOpen, searchOpen, searchActiveAnim]);

  useEffect(() => {
    Animated.spring(profileMenuAnim, {
      toValue: profileMenuOpen ? 1 : 0,
      friction: 9,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [profileMenuOpen, profileMenuAnim]);

  // Left Slot Interpolations: Search (Feed) <-> Back Arrow (Profile) <-> Close (Search Open)
  const searchIconOpacity = Animated.multiply(
    profileAnim.interpolate({
      inputRange: [0, 0.45],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
    searchActiveAnim.interpolate({
      inputRange: [0, 0.45],
      outputRange: [1, 0],
      extrapolate: "clamp",
    })
  );
  const searchIconScale = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.65],
    extrapolate: "clamp",
  });
  const searchIconRotate = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-60deg"],
    extrapolate: "clamp",
  });

  const backIconOpacity = Animated.multiply(
    profileAnim.interpolate({
      inputRange: [0.55, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    searchActiveAnim.interpolate({
      inputRange: [0, 0.45],
      outputRange: [1, 0],
      extrapolate: "clamp",
    })
  );
  const backIconScale = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
    extrapolate: "clamp",
  });
  const backIconRotate = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["60deg", "0deg"],
    extrapolate: "clamp",
  });

  const closeSearchIconOpacity = searchActiveAnim.interpolate({
    inputRange: [0.55, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const closeSearchIconScale = searchActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
    extrapolate: "clamp",
  });
  const closeSearchIconRotate = searchActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-60deg", "0deg"],
    extrapolate: "clamp",
  });

  const leftNormalBgOpacity = searchActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const leftSignalBgOpacity = searchActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Right Slot Interpolations: Avatar (Feed / Own Profile) <-> Chevron / Close (Other User)
  const avatarOpacity = otherUserAnim.interpolate({
    inputRange: [0, 0.45],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const avatarScale = otherUserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.65],
    extrapolate: "clamp",
  });
  const avatarRotate = otherUserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-45deg"],
    extrapolate: "clamp",
  });

  const otherUserBtnOpacity = otherUserAnim.interpolate({
    inputRange: [0.55, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const otherUserBtnScale = otherUserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
    extrapolate: "clamp",
  });
  const otherUserBtnRotate = otherUserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["45deg", "0deg"],
    extrapolate: "clamp",
  });

  const chevronMenuOpacity = profileMenuAnim.interpolate({
    inputRange: [0, 0.45],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const chevronMenuRotate = profileMenuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
    extrapolate: "clamp",
  });
  const chevronMenuScale = profileMenuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.65],
    extrapolate: "clamp",
  });

  const closeMenuOpacity = profileMenuAnim.interpolate({
    inputRange: [0.55, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const closeMenuRotate = profileMenuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-90deg", "0deg"],
    extrapolate: "clamp",
  });
  const closeMenuScale = profileMenuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
    extrapolate: "clamp",
  });

  const otherUserNormalBgOpacity = profileMenuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const otherUserSignalBgOpacity = profileMenuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Render resting Left Button with continuous morphing layers
  const renderRestingLeftButton = () => (
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
      style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
    >
      {/* Background Layer: Normal Bg */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.sideBtnBg,
          { opacity: leftNormalBgOpacity },
        ]}
      />
      {/* Background Layer: Signal Bg */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.sideBtnSignal,
          { opacity: leftSignalBgOpacity },
        ]}
      />

      {/* Icon Layer 1: Search (Feed) */}
      <Animated.View
        style={[
          styles.iconLayer,
          {
            opacity: searchIconOpacity,
            transform: [
              { scale: searchIconScale },
              { rotate: searchIconRotate },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="search" size={20} color={colors.text} />
      </Animated.View>

      {/* Icon Layer 2: Back Arrow (Profile) */}
      <Animated.View
        style={[
          styles.iconLayer,
          {
            opacity: backIconOpacity,
            transform: [{ scale: backIconScale }, { rotate: backIconRotate }],
          },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </Animated.View>

      {/* Icon Layer 3: Close (Search / Panel Open) */}
      <Animated.View
        style={[
          styles.iconLayer,
          {
            opacity: closeSearchIconOpacity,
            transform: [
              { scale: closeSearchIconScale },
              { rotate: closeSearchIconRotate },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="close" size={20} color={colors.signalForeground} />
      </Animated.View>
    </Pressable>
  );

  // Render resting Right Button with continuous morphing layers
  const renderRestingRightButton = () => (
    <View style={styles.sideBtn}>
      {/* Avatar Layer (Feed / Own Profile) */}
      <Animated.View
        style={[
          styles.slotButtonLayer,
          {
            opacity: avatarOpacity,
            transform: [{ scale: avatarScale }, { rotate: avatarRotate }],
          },
        ]}
        pointerEvents={isOtherUser ? "none" : "auto"}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account and options"
          onPress={onToggleSearch}
          onLongPress={onRightLongPress}
          delayLongPress={320}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <View style={styles.avatarButtonCircle}>
            <Image source={userAvatar} style={styles.dockAvatarImg} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Other User Options Layer (Chevron-Up <-> Close) */}
      <Animated.View
        style={[
          styles.slotButtonLayer,
          {
            opacity: otherUserBtnOpacity,
            transform: [
              { scale: otherUserBtnScale },
              { rotate: otherUserBtnRotate },
            ],
          },
        ]}
        pointerEvents={isOtherUser ? "auto" : "none"}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            profileMenuOpen ? "Close options" : "Profile options"
          }
          onPress={onToggleSearch}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          {/* Background Normal */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.sideBtnBg,
              { opacity: otherUserNormalBgOpacity },
            ]}
          />
          {/* Background Signal (when menu open) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.sideBtnSignal,
              { opacity: otherUserSignalBgOpacity },
            ]}
          />

          {/* Chevron Icon */}
          <Animated.View
            style={[
              styles.iconLayer,
              {
                opacity: chevronMenuOpacity,
                transform: [
                  { scale: chevronMenuScale },
                  { rotate: chevronMenuRotate },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="chevron-up" size={22} color={colors.text} />
          </Animated.View>

          {/* Close Icon (when menu open) */}
          <Animated.View
            style={[
              styles.iconLayer,
              {
                opacity: closeMenuOpacity,
                transform: [
                  { scale: closeMenuScale },
                  { rotate: closeMenuRotate },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="close" size={20} color={colors.signalForeground} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Search Actions Layer (when panelOpen on Feed) */}
      {panelOpen && (
        <Animated.View style={StyleSheet.absoluteFill}>
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
        </Animated.View>
      )}
    </View>
  );

  return (
    <View style={styles.bar}>
      {/* LEFT BUTTON SLOT */}
      <View style={styles.slotLeft}>
        {isInputMode ? (
          // Input mode: Resting Left Button morphs into User Avatar relative to dock height
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
              {renderRestingLeftButton()}
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
          // User Menu: Left button stays resting (Right button was the one clicked)
          renderRestingLeftButton()
        ) : isWindowActive ? (
          // Left button clicked to expand menu: morphs to Close icon relative to height!
          <>
            {/* Resting Button (Search / Back / Close) */}
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
              {renderRestingLeftButton()}
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
          renderRestingLeftButton()
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
              {renderRestingRightButton()}
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
          // User Menu: Right button morphs into Close button relative to height!
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
              {renderRestingRightButton()}
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
          // Other windows: Right button stays resting
          renderRestingRightButton()
        ) : (
          // Standard Resting State when Dock is completely collapsed
          renderRestingRightButton()
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
    iconLayer: {
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
      overflow: "hidden",
      position: "relative",
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

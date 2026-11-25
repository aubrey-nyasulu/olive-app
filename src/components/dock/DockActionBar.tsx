import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronUp,
  Mic,
  MicOff,
  Search,
  Send,
  X,
} from "lucide-react-native";
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
  onProfile: boolean;
  panelOpen: boolean;
  profileMenuOpen: boolean;
  isListening: boolean;
  isOtherUser: boolean;
  commentDraft: string;
  setCommentDraft: (text: string) => void;
  messageDraft: string;
  setMessageDraft: (text: string) => void;
  onSendComment: () => void;
  onSendMessage: () => void;
  onCloseExpanded: () => void;
  onLeftPress: () => void;
  onRightPress: () => void;
  onToggleListening: () => void;
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
  isListening,
  commentDraft,
  setCommentDraft,
  messageDraft,
  setMessageDraft,
  onSendComment,
  onSendMessage,
  onCloseExpanded,
  onLeftPress,
  onRightPress,
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
  const searchActiveAnim = useRef(new Animated.Value(panelOpen ? 1 : 0)).current;
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
      toValue: panelOpen ? 1 : 0,
      friction: 9,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [panelOpen, searchActiveAnim]);

  useEffect(() => {
    Animated.spring(profileMenuAnim, {
      toValue: profileMenuOpen ? 1 : 0,
      friction: 9,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [profileMenuOpen, profileMenuAnim]);

  const searchHiddenOpacity = searchActiveAnim.interpolate({
    inputRange: [0, 0.45],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Left Slot Interpolations: Profile Pic (Feed) <-> Back Arrow (Profile) <-> Cancel Search X (panelOpen)
  const avatarLeftOpacity = Animated.multiply(
    profileAnim.interpolate({
      inputRange: [0, 0.45],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
    searchHiddenOpacity
  );
  const avatarLeftScale = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.65],
    extrapolate: "clamp",
  });
  const avatarLeftRotate = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-45deg"],
    extrapolate: "clamp",
  });

  const backLeftOpacity = Animated.multiply(
    profileAnim.interpolate({
      inputRange: [0.55, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    searchHiddenOpacity
  );
  const backLeftScale = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
    extrapolate: "clamp",
  });
  const backLeftRotate = profileAnim.interpolate({
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

  // Right Slot Interpolations: Search (Feed) <-> Profile Pic (Own Profile) <-> Chevron/Close (Other User)
  const searchRightOpacity = Animated.multiply(
    profileAnim.interpolate({
      inputRange: [0, 0.45],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
    searchHiddenOpacity
  );
  const searchRightScale = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.65],
    extrapolate: "clamp",
  });
  const searchRightRotate = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-60deg"],
    extrapolate: "clamp",
  });

  const profileFadeIn = profileAnim.interpolate({
    inputRange: [0.55, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const avatarRightOpacity = Animated.multiply(
    Animated.multiply(
      profileFadeIn,
      otherUserAnim.interpolate({
        inputRange: [0, 0.45],
        outputRange: [1, 0],
        extrapolate: "clamp",
      })
    ),
    searchHiddenOpacity
  );
  const avatarRightScale = otherUserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.65],
    extrapolate: "clamp",
  });
  const avatarRightRotate = otherUserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-45deg"],
    extrapolate: "clamp",
  });

  const otherUserRightOpacity = Animated.multiply(
    Animated.multiply(
      profileFadeIn,
      otherUserAnim.interpolate({
        inputRange: [0.55, 1],
        outputRange: [0, 1],
        extrapolate: "clamp",
      })
    ),
    searchHiddenOpacity
  );
  const otherUserRightScale = otherUserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
    extrapolate: "clamp",
  });
  const otherUserRightRotate = otherUserAnim.interpolate({
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

  // Resting Left Button: Profile Pic (Feed), Back Arrow (Profile), or Cancel Search (X) when panelOpen
  const renderRestingLeftButton = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        panelOpen
          ? "Cancel search"
          : onProfile
          ? "Back to feed"
          : "Account and options"
      }
      onPress={onLeftPress}
      style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
    >
      {/* Background Normal (Back Arrow on Profile only; transparent behind Avatar) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.sideBtnBg,
          { opacity: backLeftOpacity },
        ]}
      />
      {/* Background Signal (Cancel search) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.sideBtnSignal,
          { opacity: searchActiveAnim },
        ]}
      />

      {/* Layer 1: Profile Pic (Feed) */}
      <Animated.View
        style={[
          styles.iconLayer,
          {
            opacity: avatarLeftOpacity,
            transform: [
              { scale: avatarLeftScale },
              { rotate: avatarLeftRotate },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.avatarButtonCircle}>
          <Image source={userAvatar} style={styles.dockAvatarImg} />
        </View>
      </Animated.View>

      {/* Layer 2: Back Arrow (Profile) */}
      <Animated.View
        style={[
          styles.iconLayer,
          {
            opacity: backLeftOpacity,
            transform: [{ scale: backLeftScale }, { rotate: backLeftRotate }],
          },
        ]}
        pointerEvents="none"
      >
        <ArrowLeft size={20} color={colors.text} />
      </Animated.View>

      {/* Layer 3: Cancel Search X (panelOpen) */}
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
        <X size={20} color={colors.signalForeground} />
      </Animated.View>
    </Pressable>
  );

  // Resting Right Button: Search (Feed), Profile Pic (Own Profile), Other User Menu (Other Profile), or Search Actions (panelOpen)
  const renderRestingRightButton = () => (
    <View style={styles.sideBtn}>
      {/* Layer 1: Search (Feed) */}
      <Animated.View
        style={[
          styles.slotButtonLayer,
          {
            opacity: searchRightOpacity,
            transform: [
              { scale: searchRightScale },
              { rotate: searchRightRotate },
            ],
          },
        ]}
        pointerEvents={panelOpen || onProfile ? "none" : "auto"}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search and stream controls"
          onPress={onRightPress}
          style={({ pressed }) => [
            styles.sideBtn,
            styles.sideBtnBg,
            pressed && styles.pressed,
          ]}
        >
          <Search size={20} color={colors.text} />
        </Pressable>
      </Animated.View>

      {/* Layer 2: Profile Pic (Own Profile) */}
      <Animated.View
        style={[
          styles.slotButtonLayer,
          {
            opacity: avatarRightOpacity,
            transform: [
              { scale: avatarRightScale },
              { rotate: avatarRightRotate },
            ],
          },
        ]}
        pointerEvents={panelOpen || !onProfile || isOtherUser ? "none" : "auto"}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account and options"
          onPress={onRightPress}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <View style={styles.avatarButtonCircle}>
            <Image source={userAvatar} style={styles.dockAvatarImg} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Layer 3: Other User Options (Chevron-Up <-> Close on Other Profile) */}
      <Animated.View
        style={[
          styles.slotButtonLayer,
          {
            opacity: otherUserRightOpacity,
            transform: [
              { scale: otherUserRightScale },
              { rotate: otherUserRightRotate },
            ],
          },
        ]}
        pointerEvents={
          panelOpen || !onProfile || !isOtherUser ? "none" : "auto"
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            profileMenuOpen ? "Close options" : "Profile options"
          }
          onPress={onRightPress}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.sideBtnBg,
              { opacity: otherUserNormalBgOpacity },
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.sideBtnSignal,
              { opacity: otherUserSignalBgOpacity },
            ]}
          />

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
            <ChevronUp size={22} color={colors.text} />
          </Animated.View>

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
            <X size={20} color={colors.signalForeground} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Layer 4: Search Actions (Mic / Send Arrow / Close when panelOpen) */}
      {panelOpen && (
        <Animated.View style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              activeMode === "voice"
                ? isListening
                  ? "Mute voice"
                  : "Listen voice"
                : activeMode === "type"
                ? "Submit search"
                : "Close visual search"
            }
            onPress={onRightPress}
            style={({ pressed }) => [
              styles.sideBtn,
              styles.sideBtnSignal,
              pressed && styles.pressed,
            ]}
          >
            {activeMode === "voice" ? (
              isListening ? (
                <Mic size={20} color={colors.signalForeground} />
              ) : (
                <MicOff size={20} color={colors.signalForeground} />
              )
            ) : activeMode === "type" ? (
              <ArrowRight size={20} color={colors.signalForeground} />
            ) : (
              <X size={20} color={colors.signalForeground} />
            )}
          </Pressable>
        </Animated.View>
      )}
    </View>
  );

  const renderWaveform = () =>
    showAnimatingLine || activeMode === "voice" ? (
      <DockWaveform
        showAnimatingLine={showAnimatingLine}
        isVoice={activeMode === "voice"}
        isListening={isListening}
        onToggleListening={onToggleListening}
      />
    ) : null;

  const renderMorphSlot = (
    restingNode: ReactNode,
    expandedNode: ReactNode,
    rotateExpanded = true
  ) => (
    <>
      <Animated.View
        style={[
          styles.slotButtonLayer,
          {
            opacity: restingOpacity,
            transform: [{ scale: restingScale }, { rotate: restingRotate }],
          },
        ]}
        pointerEvents={isExpanded ? "none" : "auto"}
      >
        {restingNode}
      </Animated.View>

      <Animated.View
        style={[
          styles.slotButtonLayer,
          {
            opacity: expandedOpacity,
            transform: rotateExpanded
              ? [{ scale: expandedScale }, { rotate: expandedRotate }]
              : [{ scale: expandedScale }],
          },
        ]}
        pointerEvents={isExpanded ? "auto" : "none"}
      >
        {expandedNode}
      </Animated.View>
    </>
  );

  // Determine which side morphs to Close when a menu window is expanded
  const morphLeftToClose = isUserMenu && !onProfile;
  const morphRightToClose =
    (isUserMenu && onProfile) || (isWindowActive && !isUserMenu);

  return (
    <View style={styles.bar}>
      {/* LEFT BUTTON SLOT */}
      <View style={styles.slotLeft}>
        {isInputMode
          ? renderMorphSlot(
              renderRestingLeftButton(),
              <View
                style={[
                  styles.avatarButtonCircle,
                  styles.avatarButtonCircleInputMode,
                ]}
              >
                <Image source={userAvatar} style={styles.dockAvatarImg} />
              </View>,
              false
            )
          : morphLeftToClose
          ? renderMorphSlot(
              renderRestingLeftButton(),
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
                <X size={20} color={colors.text} />
              </Pressable>
            )
          : renderRestingLeftButton()}
      </View>

      {/* CENTER SLOT */}
      <View style={styles.slotCenter}>
        {isInputMode ? (
          // Input mode: Waveform fades out, TextInput slides up
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
              {renderWaveform()}
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
            {renderWaveform()}
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
        ) : (
          renderWaveform()
        )}
      </View>

      {/* RIGHT BUTTON SLOT */}
      <View style={styles.slotRight}>
        {isInputMode
          ? renderMorphSlot(
              renderRestingRightButton(),
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
                {isComments ? (
                  <ArrowUp
                    size={20}
                    color={
                      commentDraft.trim()
                        ? colors.signalForeground
                        : colors.muted
                    }
                  />
                ) : (
                  <Send
                    size={18}
                    color={
                      messageDraft.trim()
                        ? colors.signalForeground
                        : colors.muted
                    }
                  />
                )}
              </Pressable>
            )
          : morphRightToClose
          ? renderMorphSlot(
              renderRestingRightButton(),
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
                <X size={20} color={colors.text} />
              </Pressable>
            )
          : renderRestingRightButton()}
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
  });

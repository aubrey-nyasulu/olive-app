import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStyles, type ColorPalette } from "../../theme";
import type { UserProfile } from "../../profiles";

export const COVER_EXPANDED_HEIGHT = 160;
export const NAVBAR_HEIGHT = 56;
export const SCROLL_DISTANCE = COVER_EXPANDED_HEIGHT - NAVBAR_HEIGHT; // 104
export const AVATAR_EXPANDED_SIZE = 80;
export const AVATAR_COLLAPSED_SIZE = 36;
export const FOLLOW_BTN_HEIGHT = 36;

interface ProfileHeaderProps {
  profile: UserProfile;
  isMe: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
  scrollY: Animated.Value;
}

export function ProfileHeader({
  profile,
  isMe,
  isFollowing,
  onToggleFollow,
  scrollY,
}: ProfileHeaderProps) {
  const { styles, colors, isDark } = useThemeStyles(createStyles);
  const insets = useSafeAreaInsets();
  const insetsTop = insets.top;

  const expandedHeight = insetsTop + COVER_EXPANDED_HEIGHT;
  const collapsedHeight = insetsTop + NAVBAR_HEIGHT;

  // Header container height: collapses from expandedHeight to collapsedHeight,
  // and expands with overscroll
  const headerHeight = scrollY.interpolate({
    inputRange: [-100, 0, SCROLL_DISTANCE],
    outputRange: [expandedHeight + 100, expandedHeight, collapsedHeight],
    extrapolate: "clamp",
  });

  // Cover image parallax zoom on overscroll
  const coverScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.36, 1],
    extrapolateRight: "clamp",
  });

  // Frosted glass background tint in collapsed state
  const frostedOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE * 0.7, SCROLL_DISTANCE],
    outputRange: [0, 0.44, 1],
    extrapolate: "clamp",
  });

  // Hairline bottom border in collapsed state
  const hairlineOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE * 0.8, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Floating avatar dimensions
  const avatarSize = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [AVATAR_EXPANDED_SIZE, AVATAR_COLLAPSED_SIZE],
    extrapolate: "clamp",
  });

  const avatarRadius = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [AVATAR_EXPANDED_SIZE / 2, AVATAR_COLLAPSED_SIZE / 2],
    extrapolate: "clamp",
  });

  const avatarBorderWidth = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [4, 2],
    extrapolate: "clamp",
  });

  // Floating avatar vertical position:
  // Expanded: half in & half out of the cover bottom (expandedHeight - 40)
  // Collapsed: vertically centered in collapsed navbar (insetsTop + (56 - 36) / 2 = insetsTop + 10)
  const avatarTop = scrollY.interpolate({
    inputRange: [-100, 0, SCROLL_DISTANCE],
    outputRange: [
      expandedHeight + 100 - AVATAR_EXPANDED_SIZE / 2,
      expandedHeight - AVATAR_EXPANDED_SIZE / 2,
      insetsTop + (NAVBAR_HEIGHT - AVATAR_COLLAPSED_SIZE) / 2,
    ],
    extrapolate: "clamp",
  });

  // Floating Follow Button vertical position:
  // Expanded: sitting at initial position on right of avatar clearance row (expandedHeight + 6)
  // Collapsed: vertically centered in collapsed navbar (insetsTop + (56 - 36) / 2 = insetsTop + 10)
  const followTop = scrollY.interpolate({
    inputRange: [-100, 0, SCROLL_DISTANCE],
    outputRange: [
      expandedHeight + 100 + 6,
      expandedHeight + 6,
      insetsTop + (NAVBAR_HEIGHT - FOLLOW_BTN_HEIGHT) / 2,
    ],
    extrapolate: "clamp",
  });

  // Collapsed title & handle
  const collapsedTitleOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const collapsedTitleTranslateY = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE],
    outputRange: [8, 0],
    extrapolate: "clamp",
  });

  return (
    <>
      {/* 1. FIXED COLLAPSING HEADER CONTAINER */}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.headerContainer, { height: headerHeight }]}
      >
        {/* Cover Photo with Parallax Scaling */}
        <Animated.Image
          source={profile.cover}
          style={[styles.coverImage, { transform: [{ scale: coverScale }] }]}
        />

        {/* Ambient Gradient on Cover */}
        <LinearGradient
          colors={["rgba(0,0,0,0.44)", "transparent", "rgba(0,0,0,0.24)"]}
          locations={[0, 0.44, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Frosted Glass Navbar Overlay (fades in as header collapses) */}
        <Animated.View
          style={[styles.frostedOverlay, { opacity: frostedOpacity }]}
          pointerEvents="none"
        >
          <BlurView
            intensity={Platform.OS === "ios" ? 64 : 84}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.glassTintOverlay,
              isDark ? styles.glassTintDark : styles.glassTintLight,
            ]}
          />
        </Animated.View>

        {/* Hairline Border at Bottom of Collapsed Navbar */}
        <Animated.View
          style={[styles.hairlineWrap, { opacity: hairlineOpacity }]}
          pointerEvents="none"
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[
              "transparent",
              colors.line,
              isDark ? "#50372A" : "#E6CDBA",
              colors.line,
              "transparent",
            ]}
            locations={[0, 0.16, 0.5, 0.84, 1.0]}
            style={styles.hairline}
          />
        </Animated.View>

        {/* Fixed Top Bar (Collapsed Title & Handle) */}
        <View
          style={[
            styles.topBar,
            { height: collapsedHeight, paddingTop: insetsTop },
          ]}
        >
          <Animated.View
            style={[
              styles.collapsedTitleMeta,
              !isMe
                ? styles.collapsedTitleMetaOther
                : styles.collapsedTitleMetaMe,
              {
                opacity: collapsedTitleOpacity,
                transform: [{ translateY: collapsedTitleTranslateY }],
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.collapsedTitleRow}>
              <Text style={styles.collapsedName} numberOfLines={1}>
                {profile.name}
              </Text>
              {profile.kind === "Business" && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.signal}
                  style={styles.collapsedVerified}
                />
              )}
            </View>
            <Text style={styles.collapsedHandle} numberOfLines={1}>
              {profile.handle}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* 2. FLOATING & SCALING AVATAR (Smoothly transitions vertically half-in/out to navbar center) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingAvatarWrap,
          {
            top: avatarTop,
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarRadius,
            borderWidth: avatarBorderWidth,
          },
        ]}
      >
        <Animated.Image
          source={profile.avatar}
          style={[styles.floatingAvatarImg, { borderRadius: avatarRadius }]}
        />
      </Animated.View>

      {/* 3. FLOATING FOLLOW BUTTON (Smoothly transitions vertically to and from its initial position) */}
      {!isMe && (
        <Animated.View
          style={[
            styles.floatingFollowWrap,
            {
              top: followTop,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFollowing
                ? `Following ${profile.name}`
                : `Follow ${profile.name}`
            }
            onPress={onToggleFollow}
            style={({ pressed }) => [
              styles.followBtn,
              isFollowing
                ? styles.followBtnActive
                : styles.followBtnInactive,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name={isFollowing ? "checkmark-circle" : "person-add"}
              size={16}
              color={isFollowing ? colors.text : "#FFFFFF"}
            />
            <Text
              style={[
                styles.followBtnText,
                isFollowing
                  ? styles.followBtnTextActive
                  : styles.followBtnTextInactive,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}

interface ProfileHeroMetaProps {
  profile: UserProfile;
  isMe?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  scrollY?: Animated.Value;
}

export function ProfileHeroMeta({ profile }: ProfileHeroMetaProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const insets = useSafeAreaInsets();
  const expandedHeight = insets.top + COVER_EXPANDED_HEIGHT;

  return (
    <View style={styles.heroMetaContainer}>
      {/* Top spacer matching the expanded cover height */}
      <View style={{ height: expandedHeight }} />

      {/* Clearance Row for Floating Avatar bottom half & Follow Button */}
      <View style={styles.avatarClearanceRow} />

      {/* Profile Identity Group */}
      <View style={styles.metaGroup}>
        <View style={styles.nameRow}>
          <Text style={styles.profileName}>{profile.name}</Text>
          {profile.kind === "Business" && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.signal}
              style={styles.verifiedIcon}
            />
          )}
        </View>
        <Text style={styles.profileHandle}>
          {profile.handle} · {profile.neighborhood}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    headerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
    },
    coverImage: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    frostedOverlay: {
      ...StyleSheet.absoluteFill,
    },
    glassTintOverlay: {
      ...(Platform.OS === "web"
        ? ({
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          } as any)
        : {}),
    },
    glassTintLight: {
      backgroundColor: "rgba(250, 248, 245, 0.88)",
    },
    glassTintDark: {
      backgroundColor: "rgba(20, 19, 18, 0.88)",
    },
    hairlineWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 1,
    },
    hairline: {
      flex: 1,
      height: 1,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 40,
    },
    btnPressed: {
      opacity: 0.72,
    },
    collapsedTitleMeta: {
      position: "absolute",
      left: 64,
      justifyContent: "center",
    },
    collapsedTitleMetaOther: {
      right: 124,
    },
    collapsedTitleMetaMe: {
      right: 16,
    },
    collapsedTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    collapsedName: {
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: -0.2,
      color: colors.text,
    },
    collapsedVerified: {
      marginLeft: 2,
    },
    collapsedHandle: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.muted,
      marginTop: 2,
    },
    floatingAvatarWrap: {
      position: "absolute",
      left: 16,
      zIndex: 35,
      borderColor: colors.bg,
      backgroundColor: colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 6,
    },
    floatingAvatarImg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    floatingFollowWrap: {
      position: "absolute",
      right: 16,
      zIndex: 36,
    },
    followBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: FOLLOW_BTN_HEIGHT,
      paddingHorizontal: 16,
      borderRadius: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    followBtnActive: {
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    followBtnInactive: {
      backgroundColor: colors.signal,
    },
    followBtnText: {
      fontSize: 14,
      fontWeight: "700",
    },
    followBtnTextActive: {
      color: colors.text,
    },
    followBtnTextInactive: {
      color: "#FFFFFF",
    },
    heroMetaContainer: {
      width: "100%",
    },
    avatarClearanceRow: {
      height: 48,
      marginBottom: 8,
    },
    metaGroup: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileName: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.5,
      color: colors.text,
    },
    verifiedIcon: {
      marginLeft: 8,
    },
    profileHandle: {
      fontSize: 14,
      marginTop: 2,
      color: colors.muted,
    },
  });

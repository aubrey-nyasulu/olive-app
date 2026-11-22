import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, UserPlus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStyles, type ColorPalette } from "../../theme";
import type { UserProfile } from "../../profiles";

export const COVER_EXPANDED_HEIGHT = 160;
export const NAVBAR_HEIGHT = 64;
export const HERO_COLLAPSE_DISTANCE = 224; // Full hero clearance (160 + 56 + 64) - 56
export const SCROLL_DISTANCE = HERO_COLLAPSE_DISTANCE; // 224
export const AVATAR_EXPANDED_SIZE = 80;
export const AVATAR_COLLAPSED_SIZE = 48;
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
  const { width: screenWidth } = useWindowDimensions();

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

  // Floating Name & Identity horizontal position:
  // Expanded: left: 16 (aligned with screen padding)
  // Collapsed: left: 72 (12px to the right of collapsed 36px avatar at left: 16)
  const nameLeft = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [16, 72],
    extrapolate: "clamp",
  });

  // Floating Name & Identity vertical position:
  // Expanded: sits directly below avatar clearance row (expandedHeight + 56)
  // Collapsed: vertically centered in 56px navbar (insetsTop + (56 - 36) / 2 = insetsTop + 10)
  const nameTop = scrollY.interpolate({
    inputRange: [-100, 0, SCROLL_DISTANCE],
    outputRange: [
      expandedHeight + 100 + 56,
      expandedHeight + 56,
      insetsTop + (NAVBAR_HEIGHT - 36) / 2,
    ],
    extrapolate: "clamp",
  });

  // Scale: 22px display font smoothly scales to ~17px navbar title (0.78 scale)
  const nameScale = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0.78],
    extrapolate: "clamp",
  });

  // Target right clearance in collapsed state: 124 if another user (follow button), 16 if me
  const targetRight = !isMe ? 124 : 16;
  const expandedMaxWidth = screenWidth - 32;
  const collapsedMaxWidth = (screenWidth - targetRight - 64) / 0.78;
  const nameMaxWidth = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [expandedMaxWidth, collapsedMaxWidth],
    extrapolate: "clamp",
  });

  // Neighborhood suffix in handle row fades out and collapses early as header collapses
  const neighborhoodOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE * 0.4],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const neighborhoodMaxWidth = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE * 0.4],
    outputRange: [200, 0],
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
              isFollowing ? styles.followBtnActive : styles.followBtnInactive,
              pressed && styles.btnPressed,
            ]}
          >
            {isFollowing ? (
              <CheckCircle2 size={16} color={colors.text} />
            ) : (
              <UserPlus size={16} color="#FFFFFF" />
            )}
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

      {/* 4. FLOATING NAME & IDENTITY (Seamlessly animates/translates into collapsing navbar) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingNameWrap,
          {
            top: nameTop,
            left: nameLeft,
            maxWidth: nameMaxWidth,
            transform: [{ scale: nameScale }],
          },
        ]}
      >
        <View style={styles.nameRow}>
          <Text style={styles.profileName} numberOfLines={1}>
            {profile.name}
          </Text>
          {profile.kind === "Business" && (
            <CheckCircle2
              size={18}
              color={colors.signal}
              style={styles.verifiedIcon}
            />
          )}
        </View>
        <View style={styles.floatingHandleRow}>
          <Text style={styles.profileHandle} numberOfLines={1}>
            {profile.handle}
          </Text>
          <Animated.Text
            style={[
              styles.neighborhoodText,
              {
                opacity: neighborhoodOpacity,
                maxWidth: neighborhoodMaxWidth,
              },
            ]}
            numberOfLines={1}
          >
            {" "}
            · {profile.neighborhood}
          </Animated.Text>
        </View>
      </Animated.View>
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
  const { styles } = useThemeStyles(createStyles);
  const insets = useSafeAreaInsets();
  const expandedHeight = insets.top + COVER_EXPANDED_HEIGHT;

  return (
    <View style={styles.heroMetaContainer}>
      {/* Top spacer matching the expanded cover height */}
      <View style={{ height: expandedHeight }} />

      {/* Clearance Row for Floating Avatar bottom half & Follow Button */}
      <View style={styles.avatarClearanceRow} />

      {/* Clearance Spacer matching the floating Name & Identity Group */}
      <View style={styles.metaSpacer} />
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
      // elevation: 4,
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
    btnPressed: {
      opacity: 0.72,
    },
    floatingNameWrap: {
      position: "absolute",
      zIndex: 37,
      elevation: 8,
      transformOrigin: "left top",
    },
    floatingHandleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },
    neighborhoodText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.muted,
      overflow: "hidden",
    },
    metaSpacer: {
      height: 48,
      marginBottom: 16,
    },
    floatingAvatarWrap: {
      position: "absolute",
      left: 16,
      zIndex: 35,
      borderColor: colors.bg,
      backgroundColor: colors.surface,
      // shadowColor: "#000",
      // shadowOffset: { width: 0, height: 4 },
      // shadowOpacity: 0.16,
      // shadowRadius: 8,
      // elevation: 6,
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
      color: colors.muted,
    },
  });

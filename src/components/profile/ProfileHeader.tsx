import { useRef, useState } from "react";
import {
  Animated,
  Image,
  type ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { PROFILES, type UserProfile } from "../../profiles";
import { useOlive } from "../../context/OliveProvider";

export const COVER_EXPANDED_HEIGHT = 160;
export const NAVBAR_HEIGHT = 64;
export const AVATAR_EXPANDED_SIZE = 80;
export const AVATAR_COLLAPSED_SIZE = 48;
export const FOLLOW_BTN_HEIGHT = 36;
export const FOLLOW_COLLAPSED_WIDTH = 96;

/** Default fallback height of the in-flow hero content between cover bottom and tab bar */
export const HERO_META_HEIGHT = 274;

export interface FollowButtonLayout {
  topOffset: number;
  left: number;
  width: number;
}

interface ProfileHeaderProps {
  profile: UserProfile;
  isMe: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
  scrollY: Animated.Value;
  collapseDistance: number;
  followLayout: FollowButtonLayout;
}

export function ProfileHeader({
  profile,
  isMe,
  isFollowing,
  onToggleFollow,
  scrollY,
  collapseDistance,
  followLayout,
}: ProfileHeaderProps) {
  const { styles, colors, isDark } = useThemeStyles(createStyles);
  const insets = useSafeAreaInsets();
  const insetsTop = insets.top;
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(
    Math.min(windowWidth, 600)
  );

  const expandedHeight = insetsTop + COVER_EXPANDED_HEIGHT;
  const collapsedHeight = insetsTop + NAVBAR_HEIGHT;
  const distance = Math.max(1, collapseDistance);

  // Header container height: collapses from expandedHeight to collapsedHeight, expands on overscroll
  const headerHeight = scrollY.interpolate({
    inputRange: [-100, 0, distance],
    outputRange: [expandedHeight + 100, expandedHeight, collapsedHeight],
    extrapolate: "clamp",
  });

  // Cover image parallax zoom on overscroll
  const coverScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.36, 1],
    extrapolateRight: "clamp",
  });

  // Frosted glass navbar tint fades in as header collapses
  const frostedOpacity = scrollY.interpolate({
    inputRange: [0, distance * 0.7, distance],
    outputRange: [0, 0.44, 1],
    extrapolate: "clamp",
  });

  // Hairline bottom border in collapsed navbar state
  const hairlineOpacity = scrollY.interpolate({
    inputRange: [distance * 0.8, distance],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Floating avatar scaling & vertical position
  const avatarSize = scrollY.interpolate({
    inputRange: [0, distance],
    outputRange: [AVATAR_EXPANDED_SIZE, AVATAR_COLLAPSED_SIZE],
    extrapolate: "clamp",
  });

  const avatarRadius = scrollY.interpolate({
    inputRange: [0, distance],
    outputRange: [AVATAR_EXPANDED_SIZE / 2, AVATAR_COLLAPSED_SIZE / 2],
    extrapolate: "clamp",
  });

  const avatarBorderWidth = scrollY.interpolate({
    inputRange: [0, distance],
    outputRange: [4, 2],
    extrapolate: "clamp",
  });

  const avatarTop = scrollY.interpolate({
    inputRange: [-100, 0, distance],
    outputRange: [
      expandedHeight + 100 - AVATAR_EXPANDED_SIZE / 2,
      expandedHeight - AVATAR_EXPANDED_SIZE / 2,
      insetsTop + (NAVBAR_HEIGHT - AVATAR_COLLAPSED_SIZE) / 2,
    ],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  // Floating Follow button: smoothly transitions from expanded row slot into collapsed navbar right
  const followExpandedTop = expandedHeight + followLayout.topOffset;
  const followCollapsedTop =
    insetsTop + (NAVBAR_HEIGHT - FOLLOW_BTN_HEIGHT) / 2;
  const followCollapsedLeft = containerWidth - 16 - FOLLOW_COLLAPSED_WIDTH;

  const followTop = scrollY.interpolate({
    inputRange: [-100, 0, distance],
    outputRange: [
      followExpandedTop + 100,
      followExpandedTop,
      followCollapsedTop,
    ],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const followLeft = scrollY.interpolate({
    inputRange: [0, distance],
    outputRange: [followLayout.left, followCollapsedLeft],
    extrapolate: "clamp",
  });

  const followWidth = scrollY.interpolate({
    inputRange: [0, distance],
    outputRange: [followLayout.width, FOLLOW_COLLAPSED_WIDTH],
    extrapolate: "clamp",
  });

  // Floating name & neighborhood: clears shrinking avatar early, then docks in navbar
  const nameLeft = scrollY.interpolate({
    inputRange: [0, distance * 0.45, distance],
    outputRange: [16, 72, 72],
    extrapolate: "clamp",
  });

  const nameTop = scrollY.interpolate({
    inputRange: [-100, 0, distance],
    outputRange: [
      expandedHeight + 100 + 56,
      expandedHeight + 56,
      insetsTop + (NAVBAR_HEIGHT - 36) / 2,
    ],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const nameScale = scrollY.interpolate({
    inputRange: [0, distance],
    outputRange: [1, 0.78],
    extrapolate: "clamp",
  });

  const targetRight = !isMe ? FOLLOW_COLLAPSED_WIDTH + 28 : 16;
  const expandedMaxWidth = containerWidth - 32;
  const collapsedMaxWidth = (containerWidth - targetRight - 64) / 0.78;
  const nameMaxWidth = scrollY.interpolate({
    inputRange: [0, distance],
    outputRange: [expandedMaxWidth, collapsedMaxWidth],
    extrapolate: "clamp",
  });

  const neighborhoodOpacity = scrollY.interpolate({
    inputRange: [0, distance * 0.35],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const neighborhoodMaxHeight = scrollY.interpolate({
    inputRange: [0, distance * 0.35],
    outputRange: [22, 0],
    extrapolate: "clamp",
  });

  return (
    <>
      {/* 1. Fixed Collapsing Header Container */}
      <Animated.View
        pointerEvents="box-none"
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - containerWidth) > 0.5) {
            setContainerWidth(w);
          }
        }}
        style={[styles.headerContainer, { height: headerHeight }]}
      >
        <Animated.Image
          source={profile.cover}
          style={[styles.coverImage, { transform: [{ scale: coverScale }] }]}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0.44)", "transparent", "rgba(0,0,0,0.24)"]}
          locations={[0, 0.44, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

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

      {/* 2. Floating & Scaling Avatar */}
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

      {/* 3. Floating & Transitioning Follow Button */}
      {!isMe && (
        <Animated.View
          style={[
            styles.floatingFollowWrap,
            {
              top: followTop,
              left: followLeft,
              width: followWidth,
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
            <Text
              style={[
                styles.followBtnText,
                isFollowing
                  ? styles.followBtnTextActive
                  : styles.followBtnTextInactive,
              ]}
              numberOfLines={1}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* 4. Floating Name & Neighborhood */}
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
        <Text style={styles.profileName} numberOfLines={1}>
          {profile.name}
        </Text>
        <Animated.View
          style={[
            styles.floatingNeighborhoodWrap,
            {
              opacity: neighborhoodOpacity,
              maxHeight: neighborhoodMaxHeight,
            },
          ]}
        >
          <Text style={styles.neighborhoodText} numberOfLines={1}>
            {profile.neighborhood}
          </Text>
        </Animated.View>
      </Animated.View>
    </>
  );
}

interface ProfileHeroMetaProps {
  profile: UserProfile;
  isMe?: boolean;
  isFollowing?: boolean;
  scrollY: Animated.Value;
  collapseDistance: number;
  onMetaHeightChange?: (height: number) => void;
  onFollowLayoutChange?: (layout: FollowButtonLayout) => void;
}

function formatCompactCount(value: string | number): string {
  return String(value).replace(/k$/i, "K");
}

function AvatarStack({
  avatars,
  styles,
}: {
  avatars: ImageSourcePropType[];
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.avatarStack}>
      {avatars.map((source, idx) => (
        <Image
          key={idx}
          source={source}
          style={[styles.stackAvatar, idx > 0 && styles.stackAvatarOverlap]}
        />
      ))}
    </View>
  );
}

export function ProfileHeroMeta({
  profile,
  isMe = false,
  isFollowing = false,
  scrollY,
  collapseDistance,
  onMetaHeightChange,
  onFollowLayoutChange,
}: ProfileHeroMetaProps) {
  const { styles } = useThemeStyles(createStyles);
  const insets = useSafeAreaInsets();
  const expandedHeight = insets.top + COVER_EXPANDED_HEIGHT;
  const { openExpandedWindow } = useOlive();

  const leftContentTopRef = useRef<number | null>(null);
  const actionRowTopRef = useRef<number | null>(null);
  const actionRowLeftRef = useRef<number | null>(null);
  const followSlotXRef = useRef<number | null>(null);
  const followSlotWidthRef = useRef(0);

  const emitFollowLayout = () => {
    if (
      leftContentTopRef.current !== null &&
      actionRowTopRef.current !== null &&
      actionRowLeftRef.current !== null &&
      followSlotXRef.current !== null &&
      followSlotWidthRef.current > 0
    ) {
      onFollowLayoutChange?.({
        topOffset: leftContentTopRef.current + actionRowTopRef.current,
        left: actionRowLeftRef.current + followSlotXRef.current,
        width: followSlotWidthRef.current,
      });
    }
  };

  const followersDisplay =
    !isMe && typeof profile.stats.followers === "number"
      ? isFollowing
        ? profile.stats.followers + 1
        : profile.stats.followers
      : profile.stats.followers;

  const otherAvatars = Object.values(PROFILES)
    .filter((p) => p.id !== profile.id)
    .map((p) => p.avatar);
  const followerAvatars = otherAvatars.slice(0, 3);
  const followingAvatars = otherAvatars.slice(3, 6);

  // Fade out bio, message button, and follow stats before they reach the floating name
  const heroContentOpacity = scrollY.interpolate({
    inputRange: [0, Math.max(1, collapseDistance) * 0.28],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.heroMetaContainer}>
      <View style={{ height: expandedHeight }} />

      <View
        onLayout={(e) => {
          onMetaHeightChange?.(e.nativeEvent.layout.height);
        }}
      >
        <View style={styles.avatarClearance} />
        <View style={styles.metaSpacer} />

        <Animated.View
          onLayout={(e) => {
            leftContentTopRef.current = e.nativeEvent.layout.y;
            emitFollowLayout();
          }}
          style={[styles.leftAlignedContent, { opacity: heroContentOpacity }]}
          pointerEvents="box-none"
        >
          <Text style={styles.heroBio} numberOfLines={2}>
            {profile.bio}
          </Text>

          {!isMe && (
            <View
              onLayout={(e) => {
                actionRowTopRef.current = e.nativeEvent.layout.y;
                actionRowLeftRef.current = e.nativeEvent.layout.x;
                emitFollowLayout();
              }}
              style={styles.actionButtonsRow}
            >
              {/* Layout placeholder occupied by the floating transitioning Follow button at scrollY = 0 */}
              <View
                pointerEvents="none"
                onLayout={(e) => {
                  followSlotXRef.current = e.nativeEvent.layout.x;
                  followSlotWidthRef.current = e.nativeEvent.layout.width;
                  emitFollowLayout();
                }}
                style={styles.heroActionSlot}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Message ${profile.name}`}
                onPress={() =>
                  openExpandedWindow({ type: "message", recipient: profile })
                }
                style={({ pressed }) => [
                  styles.heroMessageBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.heroMessageBtnText}>Message</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.followRow}>
            <View style={styles.followGroup}>
              <AvatarStack avatars={followerAvatars} styles={styles} />
              <Text style={styles.followMetaText} numberOfLines={1}>
                <Text style={styles.followMetaCount}>
                  {formatCompactCount(followersDisplay)}
                </Text>{" "}
                followers
              </Text>
            </View>

            <View style={styles.followGroup}>
              <AvatarStack avatars={followingAvatars} styles={styles} />
              <Text style={styles.followMetaText} numberOfLines={1}>
                <Text style={styles.followMetaCount}>
                  {formatCompactCount(profile.stats.following)}
                </Text>{" "}
                following
              </Text>
            </View>
          </View>
        </Animated.View>
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
    floatingAvatarWrap: {
      position: "absolute",
      left: 16,
      zIndex: 35,
      borderColor: colors.bg,
      backgroundColor: colors.surface,
    },
    floatingAvatarImg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    floatingFollowWrap: {
      position: "absolute",
      zIndex: 36,
    },
    followBtn: {
      width: "100%",
      height: FOLLOW_BTN_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
      borderRadius: FOLLOW_BTN_HEIGHT / 2,
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
      fontSize: 13,
      fontWeight: "700",
    },
    followBtnTextActive: {
      color: colors.text,
    },
    followBtnTextInactive: {
      color: "#FFFFFF",
    },
    floatingNameWrap: {
      position: "absolute",
      zIndex: 37,
      elevation: 8,
      transformOrigin: "left top",
    },
    profileName: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.5,
      color: colors.text,
    },
    floatingNeighborhoodWrap: {
      marginTop: 2,
      overflow: "hidden",
    },
    neighborhoodText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.muted,
    },
    btnPressed: {
      opacity: 0.72,
    },
    heroMetaContainer: {
      width: "100%",
    },
    avatarClearance: {
      height: AVATAR_EXPANDED_SIZE / 2 + 8,
      marginBottom: 8,
    },
    metaSpacer: {
      height: 50,
    },
    leftAlignedContent: {
      alignItems: "flex-start",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    heroBio: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
      textAlign: "left",
      marginTop: 6,
    },
    actionButtonsRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 12,
    },
    heroActionSlot: {
      flex: 1,
      height: FOLLOW_BTN_HEIGHT,
    },
    heroMessageBtn: {
      flex: 1,
      height: FOLLOW_BTN_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
      borderRadius: FOLLOW_BTN_HEIGHT / 2,
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    heroMessageBtnText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
    },
    followRow: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      columnGap: 14,
      rowGap: 8,
      marginTop: 12,
    },
    followGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    avatarStack: {
      flexDirection: "row",
      alignItems: "center",
    },
    stackAvatar: {
      width: 24,
      height: 32,
      borderRadius: 32,
      borderWidth: 1.5,
      borderColor: colors.bg,
      backgroundColor: colors.surfaceMuted,
    },
    stackAvatarOverlap: {
      marginLeft: -6,
    },
    followMetaText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.muted,
    },
    followMetaCount: {
      fontWeight: "700",
      color: colors.text,
    },
  });

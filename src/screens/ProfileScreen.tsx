import { useMemo, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../components/Screen";
import {
  ProfileHeader,
  ProfileHeroMeta,
  COVER_EXPANDED_HEIGHT,
  NAVBAR_HEIGHT,
  SCROLL_DISTANCE,
} from "../components/profile/ProfileHeader";
import { ProfileAboutTab } from "../components/profile/ProfileAboutTab";
import { ProfilePostsTab } from "../components/profile/ProfilePostsTab";
import { ProfileRepostsTab } from "../components/profile/ProfileRepostsTab";
import {
  ProfileInteractionsTab,
  type UserInteraction,
} from "../components/profile/ProfileInteractionsTab";
import { useOlive, type ProfileTab } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";
import { getProfile, type UserProfile } from "../profiles";
import { POSTS, REVIEWS } from "../places";
import { LinearGradient } from "expo-linear-gradient";

interface TabItem {
  id: ProfileTab;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TABS: TabItem[] = [
  {
    id: "about",
    icon: "information-circle-outline",
    label: "About",
  },
  {
    id: "posts",
    icon: "grid-outline",
    label: "Posts",
  },
  {
    id: "reposted",
    icon: "repeat-outline",
    label: "Reposted",
  },
  {
    id: "interacted",
    icon: "heart-outline",
    label: "Interactions (Liked & Comments)",
  },
];

export default function ProfileScreen() {
  const { styles, colors, isDark } = useThemeStyles(createStyles);
  const insets = useSafeAreaInsets();
  const insetsTop = insets.top;
  const { profileTab, setProfileTab, likedIds, repostedIds, reviewsMap } =
    useOlive();
  const { author, id } = useLocalSearchParams<{
    author?: string;
    id?: string;
  }>();

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const dragStartY = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const recentVelocityY = useRef(0);

  const TAB_INITIAL_TOP = insetsTop + COVER_EXPANDED_HEIGHT + 120; // insetsTop + 280
  const TAB_STICKY_TOP = insetsTop + NAVBAR_HEIGHT; // insetsTop + 56
  const TAB_STICKY_SCROLL = TAB_INITIAL_TOP - TAB_STICKY_TOP; // 224 (matches SCROLL_DISTANCE)

  // Floating Tab Switcher:
  // Interpolates 1:1 with scroll from TAB_INITIAL_TOP until reaching TAB_STICKY_TOP,
  // where it stays clamped (sticky) right below the collapsed navbar.
  const tabTop = scrollY.interpolate({
    inputRange: [-100, 0, SCROLL_DISTANCE],
    outputRange: [TAB_INITIAL_TOP + 100, TAB_INITIAL_TOP, TAB_STICKY_TOP],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  // Tab content padding top when the header collapses to add some distance with the fading in border
  const tabContentPadddingTop = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE - 16, SCROLL_DISTANCE],
    outputRange: [0, 16],
    extrapolate: "clamp",
  });

  // Hairline bottom border in collapsed state
  const hairlineOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE * 0.8, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const snapTo = (targetY: number) => {
    requestAnimationFrame(() => {
      const sv = scrollRef.current;
      if (!sv) return;
      if (typeof (sv as any).scrollTo === "function") {
        (sv as any).scrollTo({ y: targetY, animated: true });
      } else if (typeof (sv as any).getNode === "function") {
        (sv as any).getNode().scrollTo({ y: targetY, animated: true });
      }
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const now = Date.now();
    const dt = now - lastScrollTime.current;
    if (dt > 8) {
      // Positive = scrolling down content (collapsing header)
      // Negative = scrolling up content (expanding header)
      recentVelocityY.current = (currentY - lastScrollY.current) / dt;
      lastScrollY.current = currentY;
      lastScrollTime.current = now;
    }
  };

  const onScrollBeginDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    dragStartY.current = y;
    lastScrollY.current = y;
    lastScrollTime.current = Date.now();
    recentVelocityY.current = 0;
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const startY = dragStartY.current;
    const delta = currentY - startY;

    // Snapping applies when the scroll ends in the intermediate collapsible zone
    // Only cares about the scroll direction — never snaps back to original position
    if (currentY > 0 && currentY < SCROLL_DISTANCE) {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;
      // If the finger was held stationary before release (>80ms), velocity is decayed
      const v = timeSinceLastScroll > 80 ? 0 : recentVelocityY.current;

      let isCollapsing: boolean;

      // 1. Decisive flick intent (quick gesture)
      if (v > 0.15) {
        isCollapsing = true;
      } else if (v < -0.15) {
        isCollapsing = false;
      }
      // 2. Net drag displacement direction:
      // delta > 0: user dragged upwards to collapse
      // delta < 0: user dragged downwards to expand
      else if (delta > 8) {
        isCollapsing = true;
      } else if (delta < -8) {
        isCollapsing = false;
      }
      // 3. Fallback for tiny/subpixel touches: snap according to midpoint
      else {
        isCollapsing = currentY >= SCROLL_DISTANCE / 2;
      }

      const targetPosition = isCollapsing ? SCROLL_DISTANCE : 0;
      snapTo(targetPosition);
    }
  };

  const profile: UserProfile = getProfile(author || id);
  const isMe = profile.id === "chisomo" || profile.id === "amara";

  // Filter posts created by the profile owner
  const ownerPosts = useMemo(() => {
    return profile.posts.filter((p) => {
      const authorNorm = p.author.toLowerCase().trim();
      const nameNorm = profile.name.toLowerCase().trim();
      const handleNorm = profile.handle.toLowerCase().replace("@", "").trim();
      return (
        authorNorm === nameNorm ||
        authorNorm === handleNorm ||
        authorNorm.includes(nameNorm) ||
        nameNorm.includes(authorNorm)
      );
    });
  }, [profile]);

  // Posts reposted by the user
  const repostedPosts = useMemo(() => {
    if (isMe) {
      return POSTS.filter((p) => repostedIds.includes(p.id));
    }
    return POSTS.filter(
      (p) => p.id === "park-live" || p.id === "saturday-market"
    );
  }, [isMe, repostedIds]);

  // Liked posts
  const likedPosts = useMemo(() => {
    if (isMe) {
      return POSTS.filter((p) => likedIds.includes(p.id));
    }
    return POSTS.filter(
      (p) =>
        p.id === "forno" || p.id === "kuchawe-chambo" || p.id === "park-live"
    );
  }, [isMe, likedIds]);

  // User interactions (reviews / comments)
  const userInteractions = useMemo<UserInteraction[]>(() => {
    const list: UserInteraction[] = [];
    POSTS.forEach((post) => {
      const reviews = reviewsMap[post.id] ?? REVIEWS[post.id] ?? [];
      reviews.forEach((r) => {
        const byNorm = r.by.toLowerCase().trim();
        const nameNorm = profile.name.toLowerCase().trim();
        const isAuthor =
          byNorm === nameNorm ||
          byNorm.includes("chisomo") ||
          (isMe &&
            (byNorm === "chisomo" ||
              byNorm === "blessings" ||
              byNorm === "kondwani"));
        if (isAuthor) {
          list.push({
            post,
            review: r,
            timeAgo: "2d ago",
          });
        }
      });
    });

    if (list.length === 0) {
      const p1 = POSTS.find((p) => p.id === "forno");
      if (p1) {
        list.push({
          post: p1,
          review: {
            by: profile.name,
            stars: 5,
            text: "Morning batch fresh until 11:00. The almond croissants and honey glaze are simply exceptional.",
          },
          timeAgo: "3d ago",
        });
      }
      const p2 = POSTS.find((p) => p.id === "park-live");
      if (p2) {
        list.push({
          post: p2,
          review: {
            by: profile.name,
            stars: 5,
            text: "Magical atmosphere under the woodland canopy.",
          },
          timeAgo: "1w ago",
        });
      }
    }
    return list;
  }, [profile, isMe, reviewsMap]);

  // Follow state for other profiles
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    forno: true,
    "park-live": true,
  });
  const isFollowing = !isMe && !!followingMap[profile.id];

  const toggleFollow = () => {
    setFollowingMap((prev) => ({
      ...prev,
      [profile.id]: !prev[profile.id],
    }));
  };

  return (
    <Screen>
      {/* Fixed Collapsible Top Header & Floating Scaling Avatar */}
      <ProfileHeader
        profile={profile}
        isMe={isMe}
        isFollowing={isFollowing}
        onToggleFollow={toggleFollow}
        scrollY={scrollY}
      />

      {/* Scrollable Profile Body */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: tabContentPadddingTop },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      >
        {/* In-Flow Hero Meta (Cover spacer, avatar clearance row, Follow button, Name & Handle) */}
        <ProfileHeroMeta
          profile={profile}
          isMe={isMe}
          isFollowing={isFollowing}
          onToggleFollow={toggleFollow}
          scrollY={scrollY}
        />

        {/* Profile Section Content */}
        <View style={styles.profileSection}>
          {/* Spacer matching the floating & sticky Tab Switcher */}
          <View style={styles.tabSpacer} />

          {/* Active Tab View */}
          {profileTab === "about" && (
            <ProfileAboutTab
              profile={profile}
              isMe={isMe}
              isFollowing={isFollowing}
            />
          )}

          {profileTab === "posts" && (
            <ProfilePostsTab posts={ownerPosts} userName={profile.name} />
          )}

          {profileTab === "reposted" && (
            <ProfileRepostsTab posts={repostedPosts} userName={profile.name} />
          )}

          {profileTab === "interacted" && (
            <ProfileInteractionsTab
              likedPosts={likedPosts}
              interactions={userInteractions}
              userName={profile.name}
              isMe={isMe}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/* Floating & Sticky Segmented Tab Switcher (Sticks right below collapsed navbar) */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.stickyTabWrapper,
          {
            top: tabTop,
          },
        ]}
      >
        <View style={styles.segmentedBar}>
          {TABS.map((tab) => {
            const isActive = profileTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
                onPress={() => setProfileTab(tab.id)}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
              >
                <View style={styles.iconBox}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isActive ? colors.signal : colors.muted}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

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
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 0,
      paddingBottom: 400, // Clearance for floating dock
    },
    profileSection: {
      paddingHorizontal: 16,
    },
    tabSpacer: {
      height: 72,
    },
    stickyTabWrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      zIndex: 25,
      // elevation: 4,
      backgroundColor: colors.bg,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 10,
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
    segmentedBar: {
      flexDirection: "row",
      borderRadius: 9999,
      borderWidth: 1,
      padding: 4,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    segmentBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 9999,
    },
    segmentBtnActive: {
      backgroundColor: colors.surface,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    iconBox: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
  });

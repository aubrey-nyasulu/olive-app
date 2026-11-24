import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { Footprints, GalleryVertical, Repeat2 } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../components/Screen";
import {
  ProfileHeader,
  ProfileHeroMeta,
  COVER_EXPANDED_HEIGHT,
  HERO_META_HEIGHT,
  NAVBAR_HEIGHT,
  type FollowButtonLayout,
} from "../components/profile/ProfileHeader";
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
  icon: LucideIcon;
  label: string;
}

const TABS: TabItem[] = [
  {
    id: "posts",
    icon: GalleryVertical,
    label: "Posts",
  },
  {
    id: "reposted",
    icon: Repeat2,
    label: "Reposted",
  },
  {
    id: "interacted",
    icon: Footprints,
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

  const { width: windowWidth } = useWindowDimensions();
  const profile: UserProfile = getProfile(author || id);
  const isMe = profile.id === "chisomo" || profile.id === "amara";

  const [heroMetaHeight, setHeroMetaHeight] = useState(HERO_META_HEIGHT);
  const [tabBarHeight, setTabBarHeight] = useState(72);
  const [barInnerWidth, setBarInnerWidth] = useState(
    Math.max(120, Math.min(windowWidth, 600) - 42)
  );
  const [followLayout, setFollowLayout] = useState<FollowButtonLayout>(() => ({
    topOffset: 180,
    left: 16,
    width: Math.max(96, (Math.min(windowWidth, 600) - 42) / 2),
  }));

  const activeTabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.id === profileTab)
  );
  const pillAnim = useRef(new Animated.Value(activeTabIndex)).current;
  const isFirstTabRender = useRef(true);

  useEffect(() => {
    if (isFirstTabRender.current) {
      isFirstTabRender.current = false;
      pillAnim.setValue(activeTabIndex);
      return;
    }
    Animated.spring(pillAnim, {
      toValue: activeTabIndex,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  }, [activeTabIndex, pillAnim]);

  const tabSlotWidth = barInnerWidth / TABS.length;
  const pillTranslateX = Animated.multiply(pillAnim, tabSlotWidth);

  const TAB_INITIAL_TOP = insetsTop + COVER_EXPANDED_HEIGHT + heroMetaHeight;
  const TAB_STICKY_TOP = insetsTop + NAVBAR_HEIGHT;
  const tabStickyScroll = Math.max(1, TAB_INITIAL_TOP - TAB_STICKY_TOP);

  // Floating Tab Switcher:
  // Interpolates 1:1 with scroll from TAB_INITIAL_TOP until reaching TAB_STICKY_TOP,
  // where it stays clamped (sticky) right below the collapsed navbar.
  const tabTop = scrollY.interpolate({
    inputRange: [-100, 0, tabStickyScroll],
    outputRange: [TAB_INITIAL_TOP + 100, TAB_INITIAL_TOP, TAB_STICKY_TOP],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  // Hairline bottom border in collapsed state
  const hairlineOpacity = scrollY.interpolate({
    inputRange: [tabStickyScroll * 0.8, tabStickyScroll],
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
    if (currentY > 0 && currentY < tabStickyScroll) {
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
        isCollapsing = currentY >= tabStickyScroll / 2;
      }

      const targetPosition = isCollapsing ? tabStickyScroll : 0;
      snapTo(targetPosition);
    }
  };

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
        collapseDistance={tabStickyScroll}
        followLayout={followLayout}
      />

      {/* Scrollable Profile Body */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
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
        {/* In-Flow Hero Meta */}
        <ProfileHeroMeta
          profile={profile}
          isMe={isMe}
          isFollowing={isFollowing}
          scrollY={scrollY}
          collapseDistance={tabStickyScroll}
          onMetaHeightChange={(h) => {
            setHeroMetaHeight((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
          }}
          onFollowLayoutChange={(next) => {
            setFollowLayout((prev) =>
              Math.abs(prev.topOffset - next.topOffset) > 0.5 ||
              Math.abs(prev.left - next.left) > 0.5 ||
              Math.abs(prev.width - next.width) > 0.5
                ? next
                : prev
            );
          }}
        />

        {/* Profile Section Content */}
        <View style={styles.profileSection}>
          {/* Spacer matching the floating & sticky Tab Switcher */}
          <View style={{ height: tabBarHeight + 8 }} />

          {/* Active Tab View */}
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
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setTabBarHeight((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
        }}
        style={[
          styles.stickyTabWrapper,
          {
            top: tabTop,
          },
        ]}
      >
        <View style={styles.segmentedBar}>
          <View
            style={styles.segmentedInner}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0 && Math.abs(w - barInnerWidth) > 0.5) {
                setBarInnerWidth(w);
              }
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.activePillIndicator,
                {
                  width: tabSlotWidth,
                  transform: [{ translateX: pillTranslateX }],
                },
              ]}
            />

            {TABS.map((tab) => {
              const isActive = profileTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <Pressable
                  key={tab.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={tab.label}
                  onPress={() => setProfileTab(tab.id)}
                  style={styles.segmentBtn}
                >
                  <View style={styles.iconBox}>
                    <TabIcon
                      size={18}
                      color={isActive ? colors.signal : colors.muted}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
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
    stickyTabWrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      zIndex: 25,
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
      borderRadius: 9999,
      borderWidth: 1,
      padding: 4,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    segmentedInner: {
      flexDirection: "row",
      position: "relative",
      width: "100%",
    },
    activePillIndicator: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      borderRadius: 9999,
      backgroundColor: colors.surface,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    segmentBtn: {
      flex: 1,
      zIndex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 9999,
      ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
    },
    iconBox: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
  });

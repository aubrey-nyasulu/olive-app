import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../components/Screen";
import {
  ProfileHeader,
  ProfileHeroMeta,
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
  const { styles, colors } = useThemeStyles(createStyles);
  const {
    profileTab,
    setProfileTab,
    likedIds,
    repostedIds,
    reviewsMap,
  } = useOlive();
  const { author, id } = useLocalSearchParams<{
    author?: string;
    id?: string;
  }>();

  const scrollY = useRef(new Animated.Value(0)).current;

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
        p.id === "forno" ||
        p.id === "kuchawe-chambo" ||
        p.id === "park-live"
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
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
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
          {/* Original Segmented Tab Switcher with Added Icon-Only Buttons */}
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
                  style={[
                    styles.segmentBtn,
                    isActive && styles.segmentBtnActive,
                  ]}
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
            <ProfileRepostsTab
              posts={repostedPosts}
              userName={profile.name}
            />
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
      paddingTop: 0,
      paddingBottom: 128, // Clearance for floating dock
    },
    profileSection: {
      paddingHorizontal: 16,
    },
    segmentedBar: {
      flexDirection: "row",
      borderRadius: 9999,
      borderWidth: 1,
      padding: 4,
      marginBottom: 16,
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

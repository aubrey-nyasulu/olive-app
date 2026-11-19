import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { AppShell } from "../components/AppShell";
import { Screen } from "../components/Screen";
import {
  ProfileHeader,
  ProfileHeroMeta,
} from "../components/profile/ProfileHeader";
import { ProfileAboutTab } from "../components/profile/ProfileAboutTab";
import { ProfilePostsTab } from "../components/profile/ProfilePostsTab";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";
import { getProfile, type UserProfile } from "../profiles";

export default function ProfileScreen() {
  const { styles, colors } = useThemeStyles(createStyles);
  const { profileTab, setProfileTab } = useOlive();
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

  const isAbout = profileTab === "about";
  const isPosts = profileTab === "posts";

  return (
    <AppShell>
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
            {/* Segmented Tab Switcher */}
            <View style={styles.segmentedBar}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setProfileTab("about")}
                style={[
                  styles.segmentBtn,
                  isAbout && styles.segmentBtnActive,
                ]}
              >
                <Ionicons
                  name={
                    isAbout
                      ? "information-circle"
                      : "information-circle-outline"
                  }
                  size={16}
                  color={isAbout ? colors.signal : colors.muted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    isAbout
                      ? styles.segmentTextActive
                      : styles.segmentTextInactive,
                  ]}
                >
                  About
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setProfileTab("posts")}
                style={[
                  styles.segmentBtn,
                  isPosts && styles.segmentBtnActive,
                ]}
              >
                <Ionicons
                  name={isPosts ? "calendar" : "calendar-outline"}
                  size={16}
                  color={isPosts ? colors.signal : colors.muted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    isPosts
                      ? styles.segmentTextActive
                      : styles.segmentTextInactive,
                  ]}
                >
                  Posts ({ownerPosts.length})
                </Text>
              </Pressable>
            </View>

            {/* Tab Views */}
            {isPosts ? (
              <ProfilePostsTab posts={ownerPosts} userName={profile.name} />
            ) : (
              <ProfileAboutTab
                profile={profile}
                isMe={isMe}
                isFollowing={isFollowing}
              />
            )}
          </View>
        </Animated.ScrollView>
      </Screen>
    </AppShell>
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 8,
      borderRadius: 9999,
    },
    segmentBtnActive: {
      backgroundColor: colors.surface,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    segmentText: {
      fontSize: 14,
    },
    segmentTextActive: {
      color: colors.text,
      fontWeight: "700",
    },
    segmentTextInactive: {
      color: colors.muted,
      fontWeight: "500",
    },
  });

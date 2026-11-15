import { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { AppShell } from "../components/AppShell";
import { Pill } from "../components/Pill";
import { PostCard } from "../components/PostCard";
import { Screen } from "../components/Screen";
import { useOlive } from "../context/OliveProvider";
import type { Post, TravelMode } from "../models";
import { CATEGORIES, POSTS } from "../places";
import { getProfile, type UserProfile } from "../profiles";

const RADII = [1, 3, 5, 10];

const MODES: {
  key: TravelMode;
  label: string;
  icon: "walk" | "bicycle" | "car";
}[] = [
  { key: "walking", label: "Walking", icon: "walk" },
  { key: "cycling", label: "Cycling", icon: "bicycle" },
  { key: "driving", label: "Driving", icon: "car" },
];

function SettingGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  const { colors } = useOlive();
  return (
    <View style={[styles.settingGroup, { borderTopColor: colors.line }]}>
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.settingHint, { color: colors.muted }]}>{hint}</Text>
      <View style={styles.settingBody}>{children}</View>
    </View>
  );
}

function SavedPlaceRow({
  post,
  onNavigate,
  onUnsave,
}: {
  post: Post;
  onNavigate: () => void;
  onUnsave: () => void;
}) {
  const { colors, startGuidance, closeSearch } = useOlive();

  return (
    <View style={[styles.placeRow, { borderBottomColor: colors.line }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          closeSearch();
          onNavigate();
        }}
        style={styles.placeRowContent}
      >
        <Image source={post.image} style={styles.placeThumb} />
        <View style={styles.placeRowMeta}>
          <Text style={[styles.placeRowCategory, { color: colors.muted }]}>
            {post.category}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.placeRowAuthor, { color: colors.text }]}
          >
            {post.kind === "Person" ? post.place : post.author}
          </Text>
          <Text style={[styles.placeRowWhen, { color: colors.muted }]}>
            {post.when}
          </Text>
        </View>
      </Pressable>

      <View style={styles.placeRowActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Guide me to ${post.author}`}
          onPress={() => {
            startGuidance(post);
            onNavigate();
          }}
          style={({ pressed }) => [
            styles.placeGuideBtn,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="navigate" size={17} color={colors.signal} />
        </Pressable>
        <Text style={[styles.placeDistance, { color: colors.muted }]}>
          {post.distanceKm} km
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const {
    colors,
    config,
    updateSettings,
    resetSettings,
    savedIds,
    toggleSave,
    closeSearch,
    profileTab,
    setProfileTab,
    profileModal,
    setProfileModal,
    startGuidance,
  } = useOlive();

  const { author, id } = useLocalSearchParams<{
    author?: string;
    id?: string;
  }>();
  const profile: UserProfile = getProfile(author || id);
  const isMe = profile.id === "chisomo" || profile.id === "amara";

  // Ensure that posts in the posts tab were actually made by the profile owner
  const ownerPosts = profile.posts.filter((p) => {
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

  const savedPosts = POSTS.filter((p) => savedIds.includes(p.id));

  const toggleLane = (cat: string) => {
    const next = config.lanes.includes(cat)
      ? config.lanes.filter((c) => c !== cat)
      : [...config.lanes, cat];
    updateSettings({ lanes: next });
  };

  const insets = useSafeAreaInsets();

  return (
    <AppShell>
      <Screen>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Cover Image Banner */}
          <View style={[styles.coverContainer, { height: insets.top + 160 }]}>
            <Image source={profile.cover} style={styles.coverImage} />
            <LinearGradient
              colors={["rgba(0,0,0,0.38)", "transparent", "rgba(0,0,0,0.2)"]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* Profile Section with Horizontal Padding */}
          <View style={styles.profileSection}>
            {/* Avatar Row overlapping Cover */}
            <View style={styles.avatarRow}>
              <Image
                source={profile.avatar}
                style={[
                  styles.largeAvatar,
                  { borderColor: colors.bg, backgroundColor: colors.surface },
                ]}
              />
            </View>

            {/* Profile Identity Group (Name & Handle under profile image) */}
            <View style={styles.profileHeaderMeta}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {profile.name}
                </Text>
                {profile.kind === "Business" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.signal}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
              <Text style={[styles.profileHandle, { color: colors.muted }]}>
                {profile.handle} · {profile.neighborhood}
              </Text>
            </View>

            {/* Segmented Tab Switcher (About first, Posts second) */}
            <View
              style={[
                styles.segmentedBar,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              {/* Tab 1: About / Info (First button) */}
              <Pressable
                accessibilityRole="button"
                onPress={() => setProfileTab("about")}
                style={[
                  styles.segmentBtn,
                  profileTab === "about" && [
                    styles.segmentBtnActive,
                    {
                      backgroundColor: colors.surface,
                      shadowColor: colors.text,
                    },
                  ],
                ]}
              >
                <Ionicons
                  name={
                    profileTab === "about"
                      ? "information-circle"
                      : "information-circle-outline"
                  }
                  size={16}
                  color={profileTab === "about" ? colors.signal : colors.muted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        profileTab === "about" ? colors.text : colors.muted,
                      fontWeight: profileTab === "about" ? "700" : "500",
                    },
                  ]}
                >
                  About
                </Text>
              </Pressable>

              {/* Tab 2: Posts / Drops (Second button) */}
              <Pressable
                accessibilityRole="button"
                onPress={() => setProfileTab("posts")}
                style={[
                  styles.segmentBtn,
                  profileTab === "posts" && [
                    styles.segmentBtnActive,
                    {
                      backgroundColor: colors.surface,
                      shadowColor: colors.text,
                    },
                  ],
                ]}
              >
                <Ionicons
                  name={
                    profileTab === "posts" ? "calendar" : "calendar-outline"
                  }
                  size={16}
                  color={profileTab === "posts" ? colors.signal : colors.muted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        profileTab === "posts" ? colors.text : colors.muted,
                      fontWeight: profileTab === "posts" ? "700" : "500",
                    },
                  ]}
                >
                  Posts ({ownerPosts.length})
                </Text>
              </Pressable>
            </View>

            {/* TAB CONTENT */}

            {/* 1. Posts Tab (Matching Home Feed PostCards, created by profile owner) */}
            {profileTab === "posts" && (
              <View style={styles.postsList}>
                {ownerPosts.length === 0 ? (
                  <View style={styles.emptyPostsWrap}>
                    <Ionicons
                      name="calendar-outline"
                      size={44}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.emptyPostsTitle, { color: colors.text }]}
                    >
                      No posts yet
                    </Text>
                    <Text
                      style={[styles.emptyPostsText, { color: colors.muted }]}
                    >
                      Posts by {profile.name} will appear here.
                    </Text>
                  </View>
                ) : (
                  ownerPosts.map((post) => (
                    <PostCard key={post.id} post={post} hideAuthor />
                  ))
                )}
              </View>
            )}

            {/* 2. About Tab (LinkedIn / Facebook profile info in social calendar context) */}
            {profileTab === "about" && (
              <View style={styles.aboutContainer}>
                {/* 1. Overview & Bio Card (Consistent styles with rest of about cards) */}
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <View style={styles.infoCardHeaderRow}>
                    <Ionicons name="person" size={18} color={colors.signal} />
                    <Text
                      style={[
                        styles.infoCardSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Overview & Bio
                    </Text>
                    <View style={{ flex: 1 }} />
                    <View
                      style={[
                        styles.categoryTag,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.line,
                        },
                      ]}
                    >
                      <Ionicons
                        name="sparkles"
                        size={11}
                        color={colors.signal}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.categoryTagText,
                          { color: colors.signal },
                        ]}
                      >
                        {profile.kind === "Business"
                          ? profile.category
                          : "Local Guide"}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.infoCardHeadline, { color: colors.text }]}
                  >
                    {profile.info.headline}
                  </Text>

                  {/* Bio description */}
                  <Text
                    style={[styles.profileBio, { color: colors.textSecondary }]}
                  >
                    {profile.bio}
                  </Text>

                  {/* Integrated Stats Shelf */}
                  <View
                    style={[styles.statsShelf, { borderTopColor: colors.line }]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="View saved places"
                      onPress={() => setProfileModal("saved")}
                      style={styles.statItem}
                    >
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {profile.stats.statA.value}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.muted }]}>
                        {profile.stats.statA.label}
                      </Text>
                    </Pressable>

                    <View
                      style={[
                        styles.statDivider,
                        { backgroundColor: colors.line },
                      ]}
                    />

                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {profile.stats.statB.value}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.muted }]}>
                        {profile.stats.statB.label}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statDivider,
                        { backgroundColor: colors.line },
                      ]}
                    />

                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {profile.stats.statC.value}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.muted }]}>
                        {profile.stats.statC.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Social Calendar Schedule & Drop Habits */}
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <View style={styles.infoCardHeaderRow}>
                    <Ionicons name="calendar" size={18} color={colors.signal} />
                    <Text
                      style={[
                        styles.infoCardSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Calendar & Schedule
                    </Text>
                  </View>

                  <View style={styles.scheduleItem}>
                    <Text
                      style={[styles.scheduleLabel, { color: colors.muted }]}
                    >
                      Hours / Timing
                    </Text>
                    <Text
                      style={[styles.scheduleValue, { color: colors.text }]}
                    >
                      {profile.info.hoursOrSchedule}
                    </Text>
                  </View>

                  <View style={styles.scheduleItem}>
                    <Text
                      style={[styles.scheduleLabel, { color: colors.muted }]}
                    >
                      Drop Cadence
                    </Text>
                    <Text
                      style={[
                        styles.scheduleValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {profile.info.calendarHabits}
                    </Text>
                  </View>
                </View>

                {/* Location & Navigation */}
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <View style={styles.infoCardHeaderRow}>
                    <Ionicons name="location" size={18} color={colors.signal} />
                    <Text
                      style={[
                        styles.infoCardSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Location
                    </Text>
                  </View>
                  <Text
                    style={[styles.locationAddress, { color: colors.text }]}
                  >
                    {profile.info.location}
                  </Text>

                  {profile.posts[0] && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => startGuidance(profile.posts[0])}
                      style={[
                        styles.directionsActionBtn,
                        { backgroundColor: colors.text },
                      ]}
                    >
                      <Ionicons name="navigate" size={15} color={colors.bg} />
                      <Text
                        style={[
                          styles.directionsActionBtnText,
                          { color: colors.bg },
                        ]}
                      >
                        Start In-App Guidance ({profile.posts[0].distanceKm} km)
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Highlights & Badges */}
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <View style={styles.infoCardHeaderRow}>
                    <Ionicons name="sparkles" size={18} color={colors.signal} />
                    <Text
                      style={[
                        styles.infoCardSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Highlights & Amenities
                    </Text>
                  </View>
                  <View style={styles.badgesWrap}>
                    {profile.info.badges.map((badge) => (
                      <View
                        key={badge}
                        style={[
                          styles.badgeChip,
                          {
                            backgroundColor: colors.surfaceMuted,
                            borderColor: colors.line,
                          },
                        ]}
                      >
                        <Ionicons
                          name="sparkles"
                          size={12}
                          color={colors.signal}
                        />
                        <Text
                          style={[styles.badgeChipText, { color: colors.text }]}
                        >
                          {badge}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Community & Social Links */}
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <View style={styles.infoCardHeaderRow}>
                    <Ionicons
                      name="globe-outline"
                      size={18}
                      color={colors.signal}
                    />
                    <Text
                      style={[
                        styles.infoCardSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Contact & Community
                    </Text>
                  </View>

                  {profile.info.phone && (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(`tel:${profile.info.phone}`)
                      }
                      style={styles.contactRow}
                    >
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color={colors.signal}
                      />
                      <Text
                        style={[styles.contactRowText, { color: colors.text }]}
                      >
                        {profile.info.phone}
                      </Text>
                    </Pressable>
                  )}

                  {profile.info.website && (
                    <View style={styles.contactRow}>
                      <Ionicons
                        name="globe-outline"
                        size={16}
                        color={colors.signal}
                      />
                      <Text
                        style={[styles.contactRowText, { color: colors.text }]}
                      >
                        {profile.info.website}
                      </Text>
                    </View>
                  )}

                  {profile.info.social && (
                    <View style={styles.contactRow}>
                      <Ionicons
                        name="logo-instagram"
                        size={16}
                        color={colors.signal}
                      />
                      <Text
                        style={[styles.contactRowText, { color: colors.text }]}
                      >
                        {profile.info.social}
                      </Text>
                    </View>
                  )}

                  {profile.info.memberSince && (
                    <View style={styles.contactRow}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={16}
                        color={colors.muted}
                      />
                      <Text
                        style={[styles.contactRowText, { color: colors.muted }]}
                      >
                        {profile.info.memberSince}
                      </Text>
                    </View>
                  )}
                </View>

                {/* If viewing own profile, shortcut to app settings */}
                {isMe && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setProfileModal("settings")}
                    style={[
                      styles.settingsShortcutBtn,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.line,
                      },
                    ]}
                  >
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color={colors.signal}
                    />
                    <Text
                      style={[
                        styles.settingsShortcutBtnText,
                        { color: colors.text },
                      ]}
                    >
                      Configure App Search & Preferences
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.muted}
                    />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Settings & Saved Modal Container */}
        <Modal
          visible={profileModal !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setProfileModal(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              accessibilityLabel="Dismiss modal"
              style={[
                styles.modalBackdrop,
                { backgroundColor: colors.overlay },
              ]}
              onPress={() => setProfileModal(null)}
            />
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.signal,
                },
              ]}
            >
              {/* Top Handle & Close */}
              <View style={styles.modalHeader}>
                <View
                  style={[styles.modalHandle, { backgroundColor: colors.line }]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  onPress={() => setProfileModal(null)}
                  style={[
                    styles.modalClose,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <Ionicons name="close" size={18} color={colors.text} />
                </Pressable>
              </View>

              {/* Modal Tab Switcher */}
              <View style={styles.modalTabsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setProfileModal("saved")}
                  style={[
                    styles.modalTabBtn,
                    {
                      backgroundColor:
                        profileModal === "saved"
                          ? colors.signal
                          : colors.surfaceMuted,
                      borderColor:
                        profileModal === "saved" ? colors.signal : colors.line,
                    },
                  ]}
                >
                  <View style={styles.modalTabInner}>
                    <Ionicons
                      name={
                        profileModal === "saved"
                          ? "bookmark"
                          : "bookmark-outline"
                      }
                      size={14}
                      color={
                        profileModal === "saved"
                          ? colors.signalForeground
                          : colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.modalTabBtnText,
                        {
                          color:
                            profileModal === "saved"
                              ? colors.signalForeground
                              : colors.text,
                          fontWeight: profileModal === "saved" ? "700" : "500",
                        },
                      ]}
                    >
                      Saved ({savedPosts.length})
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setProfileModal("settings")}
                  style={[
                    styles.modalTabBtn,
                    {
                      backgroundColor:
                        profileModal === "settings"
                          ? colors.signal
                          : colors.surfaceMuted,
                      borderColor:
                        profileModal === "settings"
                          ? colors.signal
                          : colors.line,
                    },
                  ]}
                >
                  <View style={styles.modalTabInner}>
                    <Ionicons
                      name={
                        profileModal === "settings"
                          ? "settings"
                          : "settings-outline"
                      }
                      size={14}
                      color={
                        profileModal === "settings"
                          ? colors.signalForeground
                          : colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.modalTabBtnText,
                        {
                          color:
                            profileModal === "settings"
                              ? colors.signalForeground
                              : colors.text,
                          fontWeight:
                            profileModal === "settings" ? "700" : "500",
                        },
                      ]}
                    >
                      Settings
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Scrollable Modal Content */}
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {profileModal === "saved" && (
                  <View style={styles.savedModalContent}>
                    {savedPosts.length === 0 ? (
                      <View style={styles.emptySavedWrap}>
                        <Ionicons
                          name="bookmark-outline"
                          size={44}
                          color={colors.muted}
                        />
                        <Text
                          style={[
                            styles.emptySavedTitle,
                            { color: colors.text },
                          ]}
                        >
                          Nothing saved yet
                        </Text>
                        <Text
                          style={[
                            styles.emptySavedText,
                            { color: colors.muted },
                          ]}
                        >
                          Tap the bookmark icon on any post in the feed and it
                          waits here for quick guidance.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.savedList}>
                        {savedPosts.map((post) => (
                          <SavedPlaceRow
                            key={post.id}
                            post={post}
                            onNavigate={() => {
                              setProfileModal(null);
                              closeSearch();
                              router.push(`/p/${post.id}`);
                            }}
                            onUnsave={() => toggleSave(post.id)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {profileModal === "settings" && (
                  <View style={styles.settingsModalContent}>
                    <SettingGroup
                      title="Search radius"
                      hint="How far Olive looks when you need something nearby."
                    >
                      <View style={styles.pillsRow}>
                        {RADII.map((radius) => (
                          <Pill
                            key={radius}
                            active={config.radiusKm === radius}
                            onPress={() => updateSettings({ radiusKm: radius })}
                            label={`${radius} km`}
                          />
                        ))}
                      </View>
                    </SettingGroup>

                    <SettingGroup
                      title="What you're looking for"
                      hint="Olive prioritizes these first. Tap to enable or disable."
                    >
                      <View style={styles.pillsRow}>
                        {CATEGORIES.map((category) => (
                          <Pill
                            key={category}
                            active={config.lanes.includes(category)}
                            onPress={() => toggleLane(category)}
                            label={category}
                          />
                        ))}
                      </View>
                    </SettingGroup>

                    <SettingGroup
                      title="Getting around"
                      hint="Routes and travel times for in-app guidance are planned for this."
                    >
                      <View style={styles.pillsRow}>
                        {MODES.map(({ key, label }) => (
                          <Pill
                            key={key}
                            active={config.mode === key}
                            onPress={() => updateSettings({ mode: key })}
                            label={label}
                          />
                        ))}
                      </View>
                    </SettingGroup>

                    <SettingGroup
                      title="Nearby alerts"
                      hint="Subtle notifications when a live drop or session happens nearby."
                    >
                      <View
                        style={[
                          styles.toggleCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.line,
                          },
                        ]}
                      >
                        <View style={styles.toggleMeta}>
                          <Text
                            style={[styles.toggleLabel, { color: colors.text }]}
                          >
                            Push alerts
                          </Text>
                          <Text
                            style={[styles.toggleSub, { color: colors.muted }]}
                          >
                            Only when within walking radius
                          </Text>
                        </View>
                        <Switch
                          value={config.alerts}
                          onValueChange={(val) =>
                            updateSettings({ alerts: val })
                          }
                          trackColor={{
                            false: colors.surfaceMuted,
                            true: colors.signal,
                          }}
                          thumbColor="#FFFFFF"
                        />
                      </View>
                    </SettingGroup>

                    <SettingGroup
                      title="Appearance"
                      hint="Switch between daytime paper light and night-mode charcoal."
                    >
                      <View
                        style={[
                          styles.toggleCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.line,
                          },
                        ]}
                      >
                        <View style={styles.toggleMeta}>
                          <Text
                            style={[styles.toggleLabel, { color: colors.text }]}
                          >
                            Dark theme
                          </Text>
                          <Text
                            style={[styles.toggleSub, { color: colors.muted }]}
                          >
                            Warm high-contrast palette
                          </Text>
                        </View>
                        <Switch
                          value={config.dark}
                          onValueChange={(val) => updateSettings({ dark: val })}
                          trackColor={{
                            false: colors.surfaceMuted,
                            true: colors.signal,
                          }}
                          thumbColor="#FFFFFF"
                        />
                      </View>
                    </SettingGroup>

                    <Pressable
                      accessibilityRole="button"
                      onPress={resetSettings}
                      style={styles.resetBtn}
                    >
                      <Text
                        style={[styles.resetBtnText, { color: colors.muted }]}
                      >
                        Reset to defaults
                      </Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Screen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 130, // clearance for floating dock
  },
  coverContainer: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileSection: {
    paddingHorizontal: 16,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: -44,
    marginBottom: 14,
  },
  largeAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    resizeMode: "cover",
  },
  profileHeaderMeta: {
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
  },
  profileHandle: {
    fontSize: 13.5,
    marginTop: 2,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  infoCardHeadline: {
    fontSize: 15.5,
    fontWeight: "700",
    marginBottom: 6,
  },
  profileBio: {
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: 14,
  },
  statsShelf: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 22,
  },
  segmentedBar: {
    flexDirection: "row",
    borderRadius: 9999,
    borderWidth: 1,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  segmentBtnActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
  },

  /* Posts Tab (Matching Feed PostCard Feed) */
  postsList: {
    gap: 0,
  },
  emptyPostsWrap: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyPostsTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptyPostsText: {
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 19,
  },

  /* About Tab (LinkedIn / Info Card Styles) */
  aboutContainer: {
    gap: 14,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoCardBody: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  infoCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoCardSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  scheduleItem: {
    marginBottom: 10,
  },
  scheduleLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  scheduleValue: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "500",
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  directionsActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  directionsActionBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  badgeChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  contactRowText: {
    fontSize: 13.5,
    fontWeight: "500",
  },
  settingsShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  settingsShortcutBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1,
    marginLeft: 10,
  },

  /* Settings & Saved Modal Container Styles */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: "100%",
    height: "98%",
    borderRadius: 32,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  modalClose: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  modalTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  modalTabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalTabBtnText: {
    fontSize: 13,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  savedModalContent: {
    gap: 0,
  },
  settingsModalContent: {
    gap: 22,
  },
  savedList: {
    gap: 0,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  placeRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  placeThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    resizeMode: "cover",
  },
  placeRowMeta: {
    flex: 1,
  },
  placeRowCategory: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  placeRowAuthor: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  placeRowWhen: {
    fontSize: 12,
    marginTop: 2,
  },
  placeRowActions: {
    alignItems: "center",
    gap: 4,
  },
  placeGuideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeDistance: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptySavedWrap: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptySavedTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  emptySavedText: {
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 19,
  },

  settingGroup: {
    borderTopWidth: 1,
    paddingTop: 18,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  settingHint: {
    fontSize: 12.5,
    marginTop: 2,
    marginBottom: 12,
  },
  settingBody: {},
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  toggleMeta: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  resetBtn: {
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

import { useState } from "react";
import {
  Image,
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
import { router } from "expo-router";
import { AppShell } from "../components/AppShell";
import { Pill } from "../components/Pill";
import { Screen } from "../components/Screen";
import { useOlive } from "../context/OliveProvider";
import type { Post, TravelMode } from "../models";
import { CATEGORIES, POSTS } from "../places";

const avatarImage = require("../../assets/images/profile-avatar.jpg");
const coverImage = require("../../assets/images/profile-cover.jpg");

const RADII = [1, 3, 5, 10];

const MODES: { key: TravelMode; label: string; icon: "walk" | "bicycle" | "car" }[] = [
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

function PlaceRow({
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
        {/* In-App Guide button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Guide me to ${post.author}`}
          onPress={() => startGuidance(post)}
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
  } = useOlive();

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
            <Image source={coverImage} style={styles.coverImage} />
            <LinearGradient
              colors={["rgba(0,0,0,0.38)", "transparent", "rgba(0,0,0,0.18)"]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* Profile Section with Horizontal Padding */}
          <View style={styles.profileSection}>
            {/* Avatar Row overlapping Cover */}
            <View style={styles.avatarRow}>
              <Image
                source={avatarImage}
                style={[
                  styles.largeAvatar,
                  { borderColor: colors.bg, backgroundColor: colors.surface },
                ]}
              />
              <View
                style={[
                  styles.locationBadge,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.line,
                  },
                ]}
              >
                <Ionicons
                  name="location-sharp"
                  size={13}
                  color={colors.signal}
                />
                <Text
                  style={[styles.locationBadgeText, { color: colors.text }]}
                >
                  Lisboa
                </Text>
              </View>
            </View>

            {/* User Profile Info */}
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                Amara Boateng
              </Text>
              <Text style={[styles.profileHandle, { color: colors.muted }]}>
                @amara · Campo de Ourique
              </Text>
            </View>

            {/* Segmented Tab Switcher (Saved vs Settings) */}
            <View
              style={[
                styles.segmentedBar,
                { backgroundColor: colors.surfaceMuted, borderColor: colors.line },
              ]}
            >
            <Pressable
              accessibilityRole="button"
              onPress={() => setProfileTab("saved")}
              style={[
                styles.segmentBtn,
                profileTab === "saved" && [
                  styles.segmentBtnActive,
                  { backgroundColor: colors.surface, shadowColor: colors.text },
                ],
              ]}
            >
              <Ionicons
                name={profileTab === "saved" ? "bookmark" : "bookmark-outline"}
                size={16}
                color={profileTab === "saved" ? colors.signal : colors.muted}
              />
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: profileTab === "saved" ? colors.text : colors.muted,
                    fontWeight: profileTab === "saved" ? "700" : "500",
                  },
                ]}
              >
                Saved ({savedPosts.length})
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setProfileTab("settings")}
              style={[
                styles.segmentBtn,
                profileTab === "settings" && [
                  styles.segmentBtnActive,
                  { backgroundColor: colors.surface, shadowColor: colors.text },
                ],
              ]}
            >
              <Ionicons
                name={profileTab === "settings" ? "settings" : "settings-outline"}
                size={16}
                color={profileTab === "settings" ? colors.signal : colors.muted}
              />
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: profileTab === "settings" ? colors.text : colors.muted,
                    fontWeight: profileTab === "settings" ? "700" : "500",
                  },
                ]}
              >
                Settings
              </Text>
            </Pressable>
          </View>

          {/* Tab 1: Saved Places */}
          {profileTab === "saved" ? (
            savedPosts.length === 0 ? (
              <View style={styles.emptySavedWrap}>
                <Ionicons
                  name="bookmark-outline"
                  size={42}
                  color={colors.muted}
                />
                <Text style={[styles.emptySavedTitle, { color: colors.text }]}>
                  Nothing saved yet
                </Text>
                <Text style={[styles.emptySavedText, { color: colors.muted }]}>
                  Tap the bookmark icon on any post in the feed and it waits here for quick guidance.
                </Text>
              </View>
            ) : (
              <View style={styles.savedList}>
                {savedPosts.map((post) => (
                  <PlaceRow
                    key={post.id}
                    post={post}
                    onNavigate={() => {
                      closeSearch();
                      router.push(`/p/${post.id}`);
                    }}
                    onUnsave={() => toggleSave(post.id)}
                  />
                ))}
              </View>
            )
          ) : (
            /* Tab 2: Settings */
            <View style={styles.settingsList}>
              {/* Radius */}
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

              {/* Lanes / Categories */}
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

              {/* Travel Mode */}
              <SettingGroup
                title="Getting around"
                hint="Routes and travel times for in-app guidance are planned for this."
              >
                <View style={styles.pillsRow}>
                  {MODES.map((m) => (
                    <Pill
                      key={m.key}
                      active={config.mode === m.key}
                      onPress={() => updateSettings({ mode: m.key })}
                      label={m.label}
                    />
                  ))}
                </View>
              </SettingGroup>

              {/* Nearby Alerts Switch */}
              <SettingGroup
                title="Nearby alerts"
                hint="A nudge when something new opens inside your radius."
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
                      Tell me when something new opens nearby
                    </Text>
                    <Text
                      style={[styles.toggleSub, { color: colors.muted }]}
                    >
                      Only within {config.radiusKm} km of where you are.
                    </Text>
                  </View>
                  <Switch
                    value={config.alerts}
                    onValueChange={(val) => updateSettings({ alerts: val })}
                    trackColor={{ false: colors.line, true: colors.signal }}
                    thumbColor={colors.bg}
                  />
                </View>
              </SettingGroup>

              {/* Dark Theme Switch */}
              <SettingGroup
                title="Theme appearance"
                hint="Warm light paper or dark editorial ground."
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
                      Use warm dark ink ground throughout the app.
                    </Text>
                  </View>
                  <Switch
                    value={config.dark}
                    onValueChange={(val) => updateSettings({ dark: val })}
                    trackColor={{ false: colors.line, true: colors.signal }}
                    thumbColor={colors.bg}
                  />
                </View>
              </SettingGroup>

              {/* Reset to defaults */}
              <Pressable
                accessibilityRole="button"
                onPress={resetSettings}
                style={styles.resetBtn}
              >
                <Text style={[styles.resetBtnText, { color: colors.muted }]}>
                  Reset to defaults
                </Text>
              </Pressable>
            </View>
          )}
          </View>
        </ScrollView>
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
    justifyContent: "space-between",
    marginTop: -44,
    marginBottom: 12,
  },
  largeAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    resizeMode: "cover",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 4,
  },
  locationBadgeText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  profileInfo: {
    marginBottom: 20,
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
  segmentedBar: {
    flexDirection: "row",
    borderRadius: 9999,
    borderWidth: 1,
    padding: 4,
    marginBottom: 24,
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
  settingsList: {
    gap: 22,
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

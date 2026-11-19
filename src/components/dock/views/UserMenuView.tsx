import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useOlive } from "../../../context/OliveProvider";
import { getProfile } from "../../../profiles";

const userAvatar = require("../../../../assets/images/profile-avatar.jpg");

interface UserMenuViewProps {
  onClose: () => void;
  showToast: (msg: string) => void;
}

export function UserMenuView({ onClose }: UserMenuViewProps) {
  const { colors, openExpandedWindow } = useOlive();

  const handleGoProfile = () => {
    onClose();
    router.push("/profile");
  };

  const handleOpenMessages = () => {
    const recipient = getProfile("mabu");
    openExpandedWindow({ type: "message", recipient });
  };

  const handleOpenNotifications = () => {
    openExpandedWindow({ type: "notifications" });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Profile Header Card (The ONE and ONLY instance of Profile) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go to your profile"
        onPress={handleGoProfile}
        style={({ pressed }) => [
          styles.profileCard,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.line,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Image source={userAvatar} style={styles.avatar} />
        <View style={styles.profileMeta}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>
              Chisomo Banda
            </Text>
          </View>
          <Text style={[styles.handle, { color: colors.muted }]}>
            Area 10 & Old Town
          </Text>
        </View>
      </Pressable>

      {/* 2. Menu Options Group (Messages, Notifications, Saved, Settings) */}
      <View style={styles.menuGroup}>
        {/* Messages */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open messages"
          onPress={handleOpenMessages}
          style={({ pressed }) => [
            styles.menuRow,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.surface, borderColor: colors.line },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <View style={styles.labelBadgeRow}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Messages
              </Text>
              <View
                style={[styles.unreadBadge, { backgroundColor: colors.signal }]}
              >
                <Text style={styles.unreadBadgeText}>2 new</Text>
              </View>
            </View>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
              Direct chats with bakeries, venues & guides
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        {/* Notifications (Actual notification center) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          onPress={handleOpenNotifications}
          style={({ pressed }) => [
            styles.menuRow,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.surface, borderColor: colors.line },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <View style={styles.labelBadgeRow}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Notifications
              </Text>
              <View
                style={[styles.unreadBadge, { backgroundColor: colors.signal }]}
              >
                <Text style={styles.unreadBadgeText}>3 new</Text>
              </View>
            </View>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
              Live drops, venue alerts & mentions
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        {/* Saved Places */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View saved places"
          onPress={() => openExpandedWindow({ type: "profile_saved" })}
          style={({ pressed }) => [
            styles.menuRow,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.surface, borderColor: colors.line },
            ]}
          >
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>
              Saved Places
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
              Bookmarks, favorite cafes & venues
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        {/* App Settings */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => openExpandedWindow({ type: "profile_settings" })}
          style={({ pressed }) => [
            styles.menuRow,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.line,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.surface, borderColor: colors.line },
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>
              Settings & Preferences
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
              Discovery radius, categories & dark theme
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 32,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  handle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  menuGroup: {
    gap: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingRight: 12,
    borderRadius: 32,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  labelBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  unreadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

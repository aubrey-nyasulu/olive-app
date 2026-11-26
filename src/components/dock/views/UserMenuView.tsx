import { useEffect, useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MessageSquareMore, ChevronRight, Bell, Bookmark, Settings } from "lucide-react-native";
import { router } from "expo-router";
import { useOlive } from "../../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../../theme";
import { getProfile } from "../../../profiles";

const userAvatar = require("../../../../assets/images/profile-avatar.jpg");

interface UserMenuViewProps {
  onClose: () => void;
  showToast: (msg: string) => void;
}

export function UserMenuView({ onClose }: UserMenuViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { openExpandedWindow } = useOlive();
  const isNavigatingRef = useRef(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  const handleGoProfile = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    onClose();
    navTimerRef.current = setTimeout(() => {
      router.push("/profile");
      isNavigatingRef.current = false;
    }, 280);
  };

  const handleOpenMessages = () => {
    const recipient = getProfile("forno");
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
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      {/* 1. Profile Header Card */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go to your profile"
        onPress={handleGoProfile}
        style={({ pressed }) => [
          styles.profileCard,
          pressed && styles.pressed,
        ]}
      >
        <Image source={userAvatar} style={styles.avatar} />
        <View style={styles.profileMeta}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              Chisomo Banda
            </Text>
          </View>
          <Text style={styles.handle}>
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
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <MessageSquareMore
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <View style={styles.labelBadgeRow}>
              <Text style={styles.rowTitle}>
                Messages
              </Text>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>2 new</Text>
              </View>
            </View>
            <Text style={styles.rowSubtitle}>
              Direct chats with bakeries, venues & guides
            </Text>
          </View>
          <ChevronRight size={16} color={colors.muted} />
        </Pressable>

        {/* Notifications */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          onPress={handleOpenNotifications}
          style={({ pressed }) => [
            styles.menuRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <Bell
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <View style={styles.labelBadgeRow}>
              <Text style={styles.rowTitle}>
                Notifications
              </Text>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>3 new</Text>
              </View>
            </View>
            <Text style={styles.rowSubtitle}>
              Live drops, venue alerts & mentions
            </Text>
          </View>
          <ChevronRight size={16} color={colors.muted} />
        </Pressable>

        {/* Saved Places */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View saved places"
          onPress={() => openExpandedWindow({ type: "profile_saved" })}
          style={({ pressed }) => [
            styles.menuRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <Bookmark
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>
              Saved Places
            </Text>
            <Text style={styles.rowSubtitle}>
              Bookmarks, favorite cafes & venues
            </Text>
          </View>
          <ChevronRight size={16} color={colors.muted} />
        </Pressable>

        {/* App Settings */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => openExpandedWindow({ type: "profile_settings" })}
          style={({ pressed }) => [
            styles.menuRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <Settings
              size={24}
              color={colors.badgeText}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>
              Settings & Preferences
            </Text>
            <Text style={styles.rowSubtitle}>
              Discovery radius, categories & dark theme
            </Text>
          </View>
          <ChevronRight size={16} color={colors.muted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 12,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 32,
    borderWidth: 1,
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.75,
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
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  handle: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
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
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
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
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: colors.signal,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
});

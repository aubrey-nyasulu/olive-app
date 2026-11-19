import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useOlive } from "../../../context/OliveProvider";
import { POSTS } from "../../../places";

interface NotificationItem {
  id: string;
  author: string;
  text: string;
  time: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  unread: boolean;
  postId?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    author: "Mabu Artisanal Bakes",
    text: "Fresh sourdough batch just pulled from the hearth in Area 10.",
    time: "20m ago",
    icon: "sparkles",
    unread: true,
    postId: "mabu-1",
  },
  {
    id: "notif-2",
    author: "Lingadzi River Sessions",
    text: "Twilight acoustic performance starts at 5:00 PM under the fig tree.",
    time: "1h ago",
    icon: "musical-notes",
    unread: true,
    postId: "park-live-1",
  },
  {
    id: "notif-3",
    author: "Kondwani Banda",
    text: "Mentioned you in a comment on the Morning Gravel Ride drop.",
    time: "3h ago",
    icon: "chatbubble-ellipses",
    unread: true,
    postId: "chambo-1",
  },
  {
    id: "notif-4",
    author: "Tamanda Herbs",
    text: "New organic chamomile & mint bundles available at Four Seasons.",
    time: "Yesterday",
    icon: "leaf",
    unread: false,
    postId: "market-1",
  },
  {
    id: "notif-5",
    author: "Dalitso Wildlife",
    text: "Started following your Area 10 neighborhood drops.",
    time: "2d ago",
    icon: "person-add",
    unread: false,
  },
];

interface NotificationsViewProps {
  onClose: () => void;
  showToast: (msg: string) => void;
}

export function NotificationsView({
  onClose,
  showToast,
}: NotificationsViewProps) {
  const { colors, startGuidance } = useOlive();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = items.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    showToast("All notifications marked as read");
  };

  const handlePressItem = (item: NotificationItem) => {
    // Mark this item as read
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );

    if (item.postId) {
      const targetPost = POSTS.find((p) => p.id === item.postId);
      if (targetPost) {
        onClose();
        router.push(`/p/${targetPost.id}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Notifications Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.signalLight },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.signal }]}>
                {unreadCount} new
              </Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
            onPress={handleMarkAllRead}
            style={({ pressed }) => [
              styles.markReadBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.markReadText, { color: colors.signal }]}>
              Mark all read
            </Text>
          </Pressable>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.author}: ${item.text}`}
            onPress={() => handlePressItem(item)}
            style={({ pressed }) => [
              styles.itemRow,
              {
                backgroundColor: item.unread
                  ? colors.surfaceMuted
                  : colors.surface,
                borderColor: item.unread ? colors.signal : colors.line,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            {/* Category / Event Icon */}
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: item.unread
                    ? colors.signalLight
                    : colors.surfaceMuted,
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={item.unread ? colors.signal : colors.muted}
              />
            </View>

            {/* Notification Meta & Text */}
            <View style={styles.metaCol}>
              <View style={styles.authorRow}>
                <Text
                  numberOfLines={1}
                  style={[styles.authorName, { color: colors.text }]}
                >
                  {item.author}
                </Text>
                <Text style={[styles.timeText, { color: colors.muted }]}>
                  {item.time}
                </Text>
              </View>
              <Text
                numberOfLines={2}
                style={[styles.itemText, { color: colors.textSecondary }]}
              >
                {item.text}
              </Text>
            </View>

            {/* Unread indicator dot */}
            {item.unread && (
              <View
                style={[
                  styles.unreadDot,
                  { backgroundColor: colors.signal },
                ]}
              />
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  markReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  markReadText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  listContent: {
    gap: 8,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  metaCol: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 11.5,
  },
  itemText: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  Leaf,
  MessageSquareMore,
  Music,
  Sparkles,
  UserPlus,
} from "lucide-react-native";
import { useOlive } from "../../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../../theme";
import { POSTS } from "../../../places";

interface NotificationItem {
  id: string;
  author: string;
  text: string;
  time: string;
  icon: LucideIcon;
  unread: boolean;
  postId?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    author: "Mabu Artisanal Bakes",
    text: "Fresh sourdough batch just pulled from the hearth in Area 10.",
    time: "20m ago",
    icon: Sparkles,
    unread: true,
    postId: "forno",
  },
  {
    id: "notif-2",
    author: "Lingadzi River Sessions",
    text: "Twilight acoustic performance starts at 5:00 PM under the fig tree.",
    time: "1h ago",
    icon: Music,
    unread: true,
    postId: "park-live",
  },
  {
    id: "notif-3",
    author: "Kondwani Banda",
    text: "Mentioned you in a comment on the Area 43 coffee drop.",
    time: "3h ago",
    icon: MessageSquareMore,
    unread: true,
    postId: "kondwani-coffee",
  },
  {
    id: "notif-4",
    author: "Tamanda Gondwe",
    text: "Fresh mountain honey jars available at Four Seasons.",
    time: "Yesterday",
    icon: Leaf,
    unread: false,
    postId: "saturday-market",
  },
  {
    id: "notif-5",
    author: "Dalitso Phiri",
    text: "Started following your neighborhood drops.",
    time: "2d ago",
    icon: UserPlus,
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
  const { styles, colors } = useThemeStyles(createStyles);
  const { openExpandedWindow } = useOlive();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = items.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    showToast("All notifications marked as read");
  };

  const handlePressItem = (item: NotificationItem) => {
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );

    if (item.postId) {
      const targetPost = POSTS.find((p) => p.id === item.postId);
      if (targetPost) {
        openExpandedWindow({ type: "details", post: targetPost });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Notifications Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
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
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.markReadText}>
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
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.author}: ${item.text}`}
              onPress={() => handlePressItem(item)}
              style={({ pressed }) => [
                styles.itemRow,
                item.unread ? styles.itemRowUnread : styles.itemRowRead,
                pressed && styles.pressed,
              ]}
            >
              {/* Category / Event Icon */}
              <View
                style={[
                  styles.iconWrap,
                  item.unread ? styles.iconWrapUnread : styles.iconWrapRead,
                ]}
              >
                <Icon
                  size={18}
                  color={item.unread ? colors.signal : colors.muted}
                />
              </View>

              {/* Notification Meta & Text */}
              <View style={styles.metaCol}>
                <View style={styles.authorRow}>
                  <Text numberOfLines={1} style={styles.authorName}>
                    {item.author}
                  </Text>
                  <Text style={styles.timeText}>
                    {item.time}
                  </Text>
                </View>
                <Text numberOfLines={2} style={styles.itemText}>
                  {item.text}
                </Text>
              </View>

              {/* Unread indicator dot */}
              {item.unread && <View style={styles.unreadDot} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
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
    color: colors.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.signalLight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.signal,
  },
  markReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.signal,
  },
  listContent: {
    gap: 8,
    paddingBottom: 88,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  itemRowRead: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  itemRowUnread: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.signal,
  },
  pressed: {
    opacity: 0.8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapRead: {
    backgroundColor: colors.surfaceMuted,
  },
  iconWrapUnread: {
    backgroundColor: colors.signalLight,
  },
  metaCol: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  timeText: {
    fontSize: 12,
    color: colors.muted,
  },
  itemText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.signal,
  },
});

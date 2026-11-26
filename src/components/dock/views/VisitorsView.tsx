import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Eye } from "lucide-react-native";
import { PROFILES, type UserProfile } from "../../../profiles";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface VisitorEntry {
  profile: UserProfile;
  visitedAgo: string;
  visitCount: string;
}

const RECENT_VISITORS: VisitorEntry[] = [
  {
    profile: PROFILES.forno,
    visitedAgo: "14m ago",
    visitCount: "Viewed 2 times",
  },
  {
    profile: PROFILES["kondwani-coffee"],
    visitedAgo: "1h ago",
    visitCount: "Checked your posts",
  },
  {
    profile: PROFILES["saturday-market"],
    visitedAgo: "3h ago",
    visitCount: "Viewed your profile",
  },
  {
    profile: PROFILES["dalitso-photo"],
    visitedAgo: "Yesterday",
    visitCount: "Viewed 3 times",
  },
  {
    profile: PROFILES["park-live"],
    visitedAgo: "2d ago",
    visitCount: "Viewed your profile",
  },
];

interface VisitorsViewProps {
  onSelectVisitor: (visitor: UserProfile) => void;
  hideHeader?: boolean;
}

export function VisitorsView({
  onSelectVisitor,
  hideHeader = false,
}: VisitorsViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <View style={styles.headerMeta}>
            <Text style={styles.title}>Profile Visitors</Text>
            <Text style={styles.subtitle}>
              Neighbors and places that recently checked your profile
            </Text>
          </View>
          <View style={styles.badge}>
            <Eye size={12} color={colors.signal} />
            <Text style={styles.badgeText}>{RECENT_VISITORS.length} recent</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          hideHeader && { paddingTop: 14, paddingBottom: 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {RECENT_VISITORS.map(({ profile, visitedAgo, visitCount }) => (
          <Pressable
            key={profile.id}
            accessibilityRole="button"
            accessibilityLabel={`View ${profile.name}'s profile`}
            onPress={() => onSelectVisitor(profile)}
            style={({ pressed }) => [
              styles.visitorRow,
              pressed && styles.visitorRowPressed,
            ]}
          >
            <Image source={profile.avatar} style={styles.avatar} />
            <View style={styles.visitorMeta}>
              <View style={styles.nameTimeRow}>
                <Text style={styles.visitorName} numberOfLines={1}>
                  {profile.name}
                </Text>
                <Text style={styles.visitedAgo}>{visitedAgo}</Text>
              </View>
              <Text style={styles.visitorSub} numberOfLines={1}>
                {profile.neighborhood} · {visitCount}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 8,
    },
    headerMeta: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      marginTop: 2,
      color: colors.muted,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 9999,
      backgroundColor: colors.signalLight,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.signal,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 28,
      gap: 10,
    },
    visitorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surfaceMuted,
    },
    visitorRowPressed: {
      opacity: 0.78,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
    },
    visitorMeta: {
      flex: 1,
      gap: 2,
    },
    nameTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    visitorName: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    visitedAgo: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.muted,
    },
    visitorSub: {
      fontSize: 12,
      color: colors.muted,
    },
  });

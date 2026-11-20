import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOlive } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";
import type { UserProfile } from "../../profiles";

interface ProfileAboutTabProps {
  profile: UserProfile;
  isMe: boolean;
  isFollowing: boolean;
}

export function ProfileAboutTab({
  profile,
  isMe,
  isFollowing,
}: ProfileAboutTabProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { openExpandedWindow, startGuidance } = useOlive();

  const followersCount =
    !isMe &&
    profile.stats.statC.label === "Followers" &&
    typeof profile.stats.statC.value === "number"
      ? isFollowing
        ? profile.stats.statC.value + 1
        : profile.stats.statC.value
      : profile.stats.statC.value;

  return (
    <View style={styles.container}>
      {/* 1. Overview & Bio Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="person" size={18} color={colors.signal} />
          <Text style={styles.sectionTitle}>Overview & Bio</Text>
          <View style={styles.spacer} />
          <View style={styles.categoryTag}>
            <Ionicons
              name="sparkles"
              size={12}
              color={colors.signal}
              style={styles.categorySparkle}
            />
            <Text style={styles.categoryTagText}>
              {profile.kind === "Business" ? profile.category : "Local Guide"}
            </Text>
          </View>
        </View>

        <Text style={styles.cardHeadline}>{profile.info.headline}</Text>

        <Text style={styles.bioText}>{profile.bio}</Text>

        {/* Stats Shelf */}
        <View style={styles.statsShelf}>
          <Pressable
            accessibilityRole={isMe ? "button" : undefined}
            accessibilityLabel={isMe ? "View saved places" : undefined}
            onPress={
              isMe
                ? () => openExpandedWindow({ type: "profile_saved" })
                : undefined
            }
            style={styles.statItem}
          >
            <Text style={styles.statValue}>{profile.stats.statA.value}</Text>
            <Text style={styles.statLabel}>{profile.stats.statA.label}</Text>
          </Pressable>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.statB.value}</Text>
            <Text style={styles.statLabel}>{profile.stats.statB.label}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{followersCount}</Text>
            <Text style={styles.statLabel}>{profile.stats.statC.label}</Text>
          </View>
        </View>
      </View>

      {/* 2. Calendar & Schedule Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="calendar" size={18} color={colors.signal} />
          <Text style={styles.sectionTitle}>Calendar & Schedule</Text>
        </View>

        <View style={styles.scheduleItem}>
          <Text style={styles.scheduleLabel}>Hours / Timing</Text>
          <Text style={styles.scheduleValue}>
            {profile.info.hoursOrSchedule}
          </Text>
        </View>

        <View style={styles.scheduleItem}>
          <Text style={styles.scheduleLabel}>Drop Cadence</Text>
          <Text style={[styles.scheduleValue, styles.scheduleValueSecondary]}>
            {profile.info.calendarHabits}
          </Text>
        </View>
      </View>

      {/* 3. Location & Navigation Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="location" size={18} color={colors.signal} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.locationAddress}>{profile.info.location}</Text>

        {profile.posts[0] && (
          <Pressable
            accessibilityRole="button"
            onPress={() => startGuidance(profile.posts[0])}
            style={styles.directionsActionBtn}
          >
            <Ionicons name="navigate" size={15} color={colors.bg} />
            <Text style={styles.directionsActionBtnText}>
              Start In-App Guidance ({profile.posts[0].distanceKm} km)
            </Text>
          </Pressable>
        )}
      </View>

      {/* 4. Highlights & Amenities Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="sparkles" size={18} color={colors.signal} />
          <Text style={styles.sectionTitle}>Highlights & Amenities</Text>
        </View>
        <View style={styles.badgesWrap}>
          {profile.info.badges.map((badge) => (
            <View key={badge} style={styles.badgeChip}>
              <Ionicons name="sparkles" size={12} color={colors.signal} />
              <Text style={styles.badgeChipText}>{badge}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Contact & Community Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="globe-outline" size={18} color={colors.signal} />
          <Text style={styles.sectionTitle}>Contact & Community</Text>
        </View>

        {profile.info.phone && (
          <Pressable
            onPress={() => Linking.openURL(`tel:${profile.info.phone}`)}
            style={styles.contactRow}
          >
            <Ionicons name="call-outline" size={16} color={colors.signal} />
            <Text style={styles.contactRowText}>{profile.info.phone}</Text>
          </Pressable>
        )}

        {profile.info.website && (
          <View style={styles.contactRow}>
            <Ionicons name="globe-outline" size={16} color={colors.signal} />
            <Text style={styles.contactRowText}>{profile.info.website}</Text>
          </View>
        )}

        {profile.info.social && (
          <View style={styles.contactRow}>
            <Ionicons name="logo-instagram" size={16} color={colors.signal} />
            <Text style={styles.contactRowText}>{profile.info.social}</Text>
          </View>
        )}

        {profile.info.memberSince && (
          <View style={styles.contactRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.muted}
            />
            <Text style={[styles.contactRowText, styles.contactRowTextMuted]}>
              {profile.info.memberSince}
            </Text>
          </View>
        )}
      </View>

      {/* If viewing own profile, shortcut to app settings in floating dock */}
      {isMe && (
        <Pressable
          accessibilityRole="button"
          onPress={() => openExpandedWindow({ type: "profile_settings" })}
          style={styles.settingsShortcutBtn}
        >
          <Ionicons name="options-outline" size={18} color={colors.signal} />
          <Text style={styles.settingsShortcutBtnText}>
            Configure App Search & Preferences
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      gap: 14,
    },
    infoCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      backgroundColor: colors.surface,
      borderColor: colors.line,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    spacer: {
      flex: 1,
    },
    categoryTag: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 9999,
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    categorySparkle: {
      marginRight: 4,
    },
    categoryTagText: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.3,
      color: colors.signal,
    },
    cardHeadline: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
      color: colors.text,
    },
    bioText: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 2,
      marginBottom: 16,
      color: colors.textSecondary,
    },
    statsShelf: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderTopWidth: 1,
      paddingTop: 12,
      borderTopColor: colors.line,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: colors.muted,
    },
    statDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.line,
    },
    scheduleItem: {
      marginBottom: 12,
    },
    scheduleLabel: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 2,
      color: colors.muted,
    },
    scheduleValue: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: colors.text,
    },
    scheduleValueSecondary: {
      color: colors.textSecondary,
    },
    locationAddress: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 12,
      color: colors.text,
    },
    directionsActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.text,
    },
    directionsActionBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.bg,
    },
    badgesWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    badgeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 9999,
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    badgeChipText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    contactRowText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    contactRowTextMuted: {
      color: colors.muted,
    },
    settingsShortcutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 4,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    settingsShortcutBtnText: {
      fontSize: 14,
      fontWeight: "700",
      flex: 1,
      marginLeft: 12,
      color: colors.text,
    },
  });

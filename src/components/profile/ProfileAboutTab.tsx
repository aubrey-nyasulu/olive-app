import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOlive } from "../../context/OliveProvider";
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
  const { colors, openExpandedWindow, startGuidance } = useOlive();

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
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Ionicons name="person" size={18} color={colors.signal} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overview & Bio
          </Text>
          <View style={styles.spacer} />
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
              style={styles.categorySparkle}
            />
            <Text style={[styles.categoryTagText, { color: colors.signal }]}>
              {profile.kind === "Business"
                ? profile.category
                : "Local Guide"}
            </Text>
          </View>
        </View>

        <Text style={[styles.cardHeadline, { color: colors.text }]}>
          {profile.info.headline}
        </Text>

        <Text style={[styles.bioText, { color: colors.textSecondary }]}>
          {profile.bio}
        </Text>

        {/* Stats Shelf */}
        <View style={[styles.statsShelf, { borderTopColor: colors.line }]}>
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
            <Text style={[styles.statValue, { color: colors.text }]}>
              {profile.stats.statA.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {profile.stats.statA.label}
            </Text>
          </Pressable>

          <View style={[styles.statDivider, { backgroundColor: colors.line }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {profile.stats.statB.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {profile.stats.statB.label}
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.line }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {followersCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {profile.stats.statC.label}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Calendar & Schedule Card */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Ionicons name="calendar" size={18} color={colors.signal} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Calendar & Schedule
          </Text>
        </View>

        <View style={styles.scheduleItem}>
          <Text style={[styles.scheduleLabel, { color: colors.muted }]}>
            Hours / Timing
          </Text>
          <Text style={[styles.scheduleValue, { color: colors.text }]}>
            {profile.info.hoursOrSchedule}
          </Text>
        </View>

        <View style={styles.scheduleItem}>
          <Text style={[styles.scheduleLabel, { color: colors.muted }]}>
            Drop Cadence
          </Text>
          <Text
            style={[styles.scheduleValue, { color: colors.textSecondary }]}
          >
            {profile.info.calendarHabits}
          </Text>
        </View>
      </View>

      {/* 3. Location & Navigation Card */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Ionicons name="location" size={18} color={colors.signal} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Location
          </Text>
        </View>
        <Text style={[styles.locationAddress, { color: colors.text }]}>
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

      {/* 4. Highlights & Amenities Card */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Ionicons name="sparkles" size={18} color={colors.signal} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
              <Text style={[styles.badgeChipText, { color: colors.text }]}>
                {badge}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Contact & Community Card */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Ionicons
            name="globe-outline"
            size={18}
            color={colors.signal}
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact & Community
          </Text>
        </View>

        {profile.info.phone && (
          <Pressable
            onPress={() => Linking.openURL(`tel:${profile.info.phone}`)}
            style={styles.contactRow}
          >
            <Ionicons
              name="call-outline"
              size={16}
              color={colors.signal}
            />
            <Text style={[styles.contactRowText, { color: colors.text }]}>
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
            <Text style={[styles.contactRowText, { color: colors.text }]}>
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
            <Text style={[styles.contactRowText, { color: colors.text }]}>
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
            <Text style={[styles.contactRowText, { color: colors.muted }]}>
              {profile.info.memberSince}
            </Text>
          </View>
        )}
      </View>

      {/* If viewing own profile, shortcut to app settings in floating dock */}
      {isMe && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            openExpandedWindow({ type: "profile_settings" })
          }
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
            style={[styles.settingsShortcutBtnText, { color: colors.text }]}
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
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
  },
  spacer: {
    flex: 1,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categorySparkle: {
    marginRight: 4,
  },
  categoryTagText: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  cardHeadline: {
    fontSize: 15.5,
    fontWeight: "700",
    marginBottom: 6,
  },
  bioText: {
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
});

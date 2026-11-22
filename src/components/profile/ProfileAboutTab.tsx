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

  const isBusinessOrEvent = profile.kind !== "Person";
  const distanceKm = profile.posts[0]?.distanceKm;

  const handleCall = () => {
    if (!profile.info.phone) return;
    Linking.openURL(`tel:${profile.info.phone.replace(/\s+/g, "")}`).catch(() => {});
  };

  const handleOpenWebsite = () => {
    if (!profile.info.website) return;
    const url = profile.info.website.startsWith("http")
      ? profile.info.website
      : `https://${profile.info.website}`;
    Linking.openURL(url).catch(() => {});
  };

  const cleanWebsiteLabel = profile.info.website
    ? profile.info.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : undefined;

  return (
    <View style={styles.container}>
      {/* 1. Identity & Narrative Story Card */}
      <View style={styles.sectionCard}>
        {/* Subtle Category & Neighborhood Eyebrow */}
        <Text style={styles.cardEyebrow} numberOfLines={1}>
          {profile.category} · {profile.neighborhood}
        </Text>

        {/* Editorial Headline */}
        {profile.info.headline ? (
          <Text style={styles.cardHeadline}>{profile.info.headline}</Text>
        ) : null}

        {/* Narrative Bio */}
        <Text style={styles.bioText}>{profile.bio}</Text>

        {/* Curated Highlights / Badges Chips */}
        {profile.info.badges && profile.info.badges.length > 0 && (
          <View style={styles.badgesWrap}>
            {profile.info.badges.map((badge) => (
              <View key={badge} style={styles.badgeChip}>
                <Ionicons name="sparkles" size={11} color={colors.signal} />
                <Text style={styles.badgeChipText}>{badge}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Integrated 3-Column Core Stats Shelf */}
        <View style={styles.statsShelf}>
          <Pressable
            accessibilityRole={isMe ? "button" : undefined}
            accessibilityLabel={isMe ? "View saved places" : undefined}
            onPress={
              isMe
                ? () => openExpandedWindow({ type: "profile_saved" })
                : undefined
            }
            style={({ pressed }) => [
              styles.statItem,
              isMe && pressed && styles.btnPressed,
            ]}
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

      {/* 2. Practical Local Dossier (Essential Facts & Actions) */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="compass-outline" size={16} color={colors.signal} />
          <Text style={styles.sectionTitle}>
            {isBusinessOrEvent ? "Visiting Details" : "Local Footprint"}
          </Text>
        </View>

        {/* Location Row with Inline Navigation Pill */}
        {profile.info.location ? (
          <View
            style={[
              styles.dossierRow,
              !isBusinessOrEvent && !profile.info.phone && !profile.info.website
                ? styles.dossierRowLast
                : undefined,
            ]}
          >
            <View style={styles.dossierLeft}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.signal}
              />
              <Text style={styles.dossierText} numberOfLines={2}>
                {profile.info.location}
              </Text>
            </View>

            {/* Compact In-App Guidance Pill Button */}
            {profile.posts[0] && typeof distanceKm === "number" && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Get directions, ${distanceKm} km away`}
                onPress={() => startGuidance(profile.posts[0])}
                style={({ pressed }) => [
                  styles.guidancePill,
                  pressed && styles.btnPressed,
                ]}
              >
                <Ionicons name="navigate" size={11} color="#FFFFFF" />
                <Text style={styles.guidancePillText}>{distanceKm} km</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {/* Business/Event Operating Hours */}
        {isBusinessOrEvent && profile.info.hoursOrSchedule ? (
          <View
            style={[
              styles.dossierRow,
              !profile.info.phone && !profile.info.website
                ? styles.dossierRowLast
                : undefined,
            ]}
          >
            <View style={styles.dossierLeft}>
              <Ionicons name="time-outline" size={16} color={colors.muted} />
              <Text style={styles.dossierText} numberOfLines={2}>
                {profile.info.hoursOrSchedule}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Quick Connect & Community Action Chips */}
        {(profile.info.phone || profile.info.website || profile.info.social) && (
          <View style={styles.actionsRow}>
            {profile.info.phone && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${profile.name}`}
                onPress={handleCall}
                style={({ pressed }) => [
                  styles.actionChip,
                  pressed && styles.btnPressed,
                ]}
              >
                <Ionicons name="call-outline" size={13} color={colors.signal} />
                <Text style={styles.actionChipText}>Call</Text>
              </Pressable>
            )}

            {cleanWebsiteLabel && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Visit website ${cleanWebsiteLabel}`}
                onPress={handleOpenWebsite}
                style={({ pressed }) => [
                  styles.actionChip,
                  pressed && styles.btnPressed,
                ]}
              >
                <Ionicons
                  name="globe-outline"
                  size={13}
                  color={colors.signal}
                />
                <Text style={styles.actionChipText} numberOfLines={1}>
                  {cleanWebsiteLabel}
                </Text>
              </Pressable>
            )}

            {profile.info.social && (
              <View style={styles.actionChip}>
                <Ionicons
                  name="logo-instagram"
                  size={13}
                  color={colors.signal}
                />
                <Text style={styles.actionChipText}>
                  {profile.info.social}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Quiet Member Footnote */}
        {profile.info.memberSince && (
          <View style={styles.memberFooter}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={colors.muted}
            />
            <Text style={styles.memberFooterText}>
              {profile.info.memberSince}
            </Text>
          </View>
        )}
      </View>

      {/* 3. Personal Settings & Search Preferences (Only if Me) */}
      {isMe && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Configure app search and preferences"
          onPress={() => openExpandedWindow({ type: "profile_settings" })}
          style={({ pressed }) => [
            styles.settingsShortcutBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <View style={styles.settingsShortcutLeft}>
            <Ionicons name="options-outline" size={18} color={colors.signal} />
            <Text style={styles.settingsShortcutBtnText}>
              App Search & Neighborhood Preferences
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    sectionCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      backgroundColor: colors.surface,
      borderColor: colors.line,
    },
    cardEyebrow: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: colors.signal,
      marginBottom: 6,
    },
    cardHeadline: {
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: -0.3,
      color: colors.text,
      marginBottom: 8,
    },
    bioText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    badgesWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    badgeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
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
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: colors.text,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: "700",
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: colors.muted,
    },
    statDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.line,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: colors.muted,
    },
    dossierRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    dossierRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 4,
    },
    dossierLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      marginRight: 8,
    },
    dossierText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      flexShrink: 1,
    },
    guidancePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 9999,
      backgroundColor: colors.signal,
    },
    guidancePillText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    actionChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 9999,
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    actionChipText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    memberFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.line,
    },
    memberFooterText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.muted,
    },
    settingsShortcutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.line,
    },
    settingsShortcutLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    settingsShortcutBtnText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    btnPressed: {
      opacity: 0.72,
    },
  });

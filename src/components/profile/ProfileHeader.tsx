import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive } from "../../context/OliveProvider";
import type { UserProfile } from "../../profiles";

interface ProfileHeaderProps {
  profile: UserProfile;
  isMe: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
}

export function ProfileHeader({
  profile,
  isMe,
  isFollowing,
  onToggleFollow,
}: ProfileHeaderProps) {
  const { colors } = useOlive();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Cover Image Banner */}
      <View style={[styles.coverContainer, { height: insets.top + 160 }]}>
        <Image source={profile.cover} style={styles.coverImage} />
        <LinearGradient
          colors={["rgba(0,0,0,0.38)", "transparent", "rgba(0,0,0,0.2)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Avatar & Follow Row */}
      <View style={styles.avatarRow}>
        <Image
          source={profile.avatar}
          style={[
            styles.largeAvatar,
            { borderColor: colors.bg, backgroundColor: colors.surface },
          ]}
        />

        {!isMe && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFollowing
                ? `Following ${profile.name}`
                : `Follow ${profile.name}`
            }
            onPress={onToggleFollow}
            style={({ pressed }) => [
              styles.followBtn,
              isFollowing
                ? [
                    styles.followBtnActive,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.line,
                    },
                  ]
                : [
                    styles.followBtnInactive,
                    {
                      backgroundColor: colors.signal,
                    },
                  ],
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons
              name={isFollowing ? "checkmark-circle" : "person-add"}
              size={15}
              color={isFollowing ? colors.text : "#FFFFFF"}
            />
            <Text
              style={[
                styles.followBtnText,
                { color: isFollowing ? colors.text : "#FFFFFF" },
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Profile Identity Group */}
      <View style={styles.metaGroup}>
        <View style={styles.nameRow}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {profile.name}
          </Text>
          {profile.kind === "Business" && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.signal}
              style={styles.verifiedIcon}
            />
          )}
        </View>
        <Text style={[styles.profileHandle, { color: colors.muted }]}>
          {profile.handle} · {profile.neighborhood}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 19,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  followBtnActive: {
    borderWidth: 1.5,
  },
  followBtnInactive: {},
  followBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  metaGroup: {
    paddingHorizontal: 16,
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
  verifiedIcon: {
    marginLeft: 6,
  },
  profileHandle: {
    fontSize: 13.5,
    marginTop: 2,
  },
});

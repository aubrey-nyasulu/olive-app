import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Bookmark,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquareMore,
  Navigation,
} from "lucide-react-native";
import type { Post } from "../../../models";
import { relatedPosts, REVIEWS } from "../../../places";
import { useOlive } from "../../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../../theme";
import { PlaceMap } from "../../PlaceMap";

interface DetailsViewProps {
  post: Post;
  onNavigate: () => void;
  onSelectPlace?: (otherPost: Post) => void;
  onOpenProfile?: () => void;
  onOpenReviews?: () => void;
  showToast?: (message: string) => void;
  hideHeader?: boolean;
}

export function DetailsView({
  post,
  onNavigate,
  onSelectPlace,
  onOpenProfile,
  onOpenReviews,
  showToast,
  hideHeader = false,
}: DetailsViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { isSaved, toggleSave, reviewsMap } = useOlive();

  const saved = isSaved(post.id);
  const nearby = relatedPosts(post);
  const reviews = reviewsMap[post.id] ?? REVIEWS[post.id] ?? [];

  const handleToggleSave = () => {
    toggleSave(post.id);
    if (showToast) {
      showToast(saved ? "Removed from saved" : "Saved to your places");
    }
  };

  const handleShare = () => {
    Share.share({
      message: `${post.author} — ${post.title} (${post.place}) on Olive!`,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Header Summary */}
      {!hideHeader && (
        <View style={styles.header}>
          <View style={styles.headerMeta}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${post.author}'s profile`}
              onPress={onOpenProfile}
              style={({ pressed }) => [
                styles.authorPressable,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.authorHeadline} numberOfLines={1}>
                {post.author}
              </Text>
            </Pressable>
            <Text style={styles.metaSubtitle}>
              {post.category} · {post.distanceKm} km · {post.when}
            </Text>
          </View>

          {/* Action icons: Save & Share */}
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? "Remove bookmark" : "Save place"}
              onPress={handleToggleSave}
              style={({ pressed }) => [
                styles.headerActionBtn,
                saved && styles.headerActionBtnSaved,
                pressed && styles.pressed,
              ]}
            >
              <Bookmark
                size={18}
                color={saved ? colors.signal : colors.text}
                fill={saved ? colors.signal : "none"}
              />
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          hideHeader && styles.scrollContentPopup,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Interactive In-App Olive Map */}
        <View style={styles.mapCardWrap}>
          <PlaceMap post={post} height={200} interactive={true} />
        </View>

        {/* Address Location Capsule */}
        <View style={styles.placeAddressRow}>
          <MapPin size={16} color={colors.signal} />
          <Text style={styles.placeAddressText} numberOfLines={2}>
            {post.place}
          </Text>
        </View>

        {/* Primary Action Button: Launch In-App Turn-by-Turn Guidance */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start in-app navigation guidance"
          onPress={onNavigate}
          style={({ pressed }) => [styles.guideBtn, pressed && styles.pressed]}
        >
          <Navigation size={18} color={colors.signalForeground} />
          <Text style={styles.guideBtnText}>Guide me there</Text>
        </Pressable>

        {/* Narrative & Body Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.bodyText}>
            <Text style={styles.bodyTitlePrefix}>{post.title}. </Text>
            {post.body}
          </Text>
        </View>

        {/* Tactical Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.gridRow}>
            <MapPin size={16} color={colors.signal} />
            <Text style={styles.gridLabel}>Area</Text>
            <Text style={styles.gridValue} numberOfLines={1}>
              {post.place}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Clock size={16} color={colors.signal} />
            <Text style={styles.gridLabel}>Hours</Text>
            <Text style={styles.gridValue} numberOfLines={1}>
              {post.when}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Navigation size={16} color={colors.signal} />
            <Text style={styles.gridLabel}>Distance</Text>
            <Text style={styles.gridValue} numberOfLines={1}>
              {post.distanceKm} km away
            </Text>
          </View>
        </View>

        {/* Community Reviews Trigger */}
        {onOpenReviews && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${reviews.length} reviews for ${post.author}`}
            onPress={onOpenReviews}
            style={({ pressed }) => [
              styles.reviewsTrigger,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.reviewsTriggerLeft}>
              <MessageSquareMore
                size={18}
                color={colors.signal}
              />
              <Text style={styles.reviewsTriggerTitle}>
                Community Reviews ({reviews.length})
              </Text>
            </View>
            <View style={styles.reviewsTriggerRight}>
              <Text style={styles.reviewsTriggerAction}>View & Add</Text>
              <ChevronRight size={14} color={colors.muted} />
            </View>
          </Pressable>
        )}

        {/* Other Options Nearby */}
        {nearby.length > 0 && (
          <View style={styles.nearbySection}>
            <Text style={styles.nearbySectionTitle}>
              Other {post.category.toLowerCase()} options nearby
            </Text>
            <View style={styles.nearbyCard}>
              {nearby.map((other, idx) => {
                const isLast = idx === nearby.length - 1;
                return (
                  <Pressable
                    key={other.id}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${other.author}`}
                    onPress={() => onSelectPlace?.(other)}
                    style={({ pressed }) => [
                      styles.nearbyRow,
                      !isLast && styles.nearbyRowBorder,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.nearbyMeta}>
                      <Text style={styles.nearbyAuthor}>{other.author}</Text>
                      <Text numberOfLines={1} style={styles.nearbyTitle}>
                        {other.title}
                      </Text>
                    </View>
                    <View style={styles.nearbyRight}>
                      <Text style={styles.nearbyDist}>
                        {other.distanceKm} km
                      </Text>
                      <ChevronRight
                        size={16}
                        color={colors.muted}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
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
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    headerMeta: {
      flex: 1,
      marginRight: 12,
    },
    authorPressable: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    authorHeadline: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.4,
      color: colors.text,
    },
    metaSubtitle: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 2,
      color: colors.muted,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    headerActionBtnSaved: {
      borderColor: colors.signal,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 88,
      gap: 16,
    },
    scrollContentPopup: {
      paddingBottom: 20,
    },
    mapCardWrap: {
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.line,
    },
    placeAddressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 4,
    },
    placeAddressText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    guideBtn: {
      height: 48,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.signal,
    },
    guideBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.signalForeground,
    },
    descriptionSection: {
      paddingHorizontal: 4,
    },
    bodyText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    bodyTitlePrefix: {
      fontWeight: "700",
      color: colors.text,
    },
    infoGrid: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 12,
      gap: 12,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    gridRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    gridLabel: {
      fontSize: 12,
      width: 64,
      color: colors.muted,
    },
    gridValue: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      color: colors.text,
    },
    reviewsTrigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    reviewsTriggerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    reviewsTriggerTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    reviewsTriggerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    reviewsTriggerAction: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.signal,
    },
    nearbySection: {
      marginTop: 4,
      gap: 8,
    },
    nearbySectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 4,
    },
    nearbyCard: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    nearbyRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    nearbyRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    nearbyMeta: {
      flex: 1,
      marginRight: 12,
    },
    nearbyAuthor: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    nearbyTitle: {
      fontSize: 12,
      marginTop: 2,
      color: colors.muted,
    },
    nearbyRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    nearbyDist: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
    },
    pressed: {
      opacity: 0.75,
    },
  });

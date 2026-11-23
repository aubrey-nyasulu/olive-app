import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  Heart,
  MessageCircle,
  Flower2,
  ThumbsUp,
  Laugh,
  Flame,
  Hand,
  MapPin,
  ChevronRight,
  Repeat2,
} from "lucide-react-native";
import { router } from "expo-router";
import type { Post, ReactionType } from "../models";
import { REVIEWS } from "../places";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";

export const POST_MEDIA_ASPECT_RATIO = 1;

/* ── Reaction definitions & Harmonious Palette ────────────────────── */

const REACTION_DEFS: {
  type: ReactionType;
  Icon: typeof Heart;
  label: string;
  activeColor: string;
}[] = [
  // 1. Love (Deep Ruby Crimson — warm, passionate, avoids harsh digital red)
  { type: "heart", Icon: Heart, label: "Love", activeColor: "#C83D4A" },
  // 2. Flowers ("Giving someone their flowers" — soft peony blossom / antique rose)
  { type: "flower", Icon: Flower2, label: "Flowers", activeColor: "#CE5A84" },
  // 3. Fire (Ember Vermilion — spicy terracotta flame, aligns with Olive signal)
  { type: "fire", Icon: Flame, label: "Fire", activeColor: "#E04F22" },
  // 4. Haha (Warm Amber Gold — golden honey joy, sunny without neon glare)
  { type: "laugh", Icon: Laugh, label: "Haha", activeColor: "#D9822B" },
  // 5. Clap (Olive Laurel — earthy botanical sage green, anchors the Olive namesake)
  { type: "clap", Icon: Hand, label: "Clap", activeColor: "#4F7E5E" },
  // 6. Like (Aegean Slate Blue — deep mineral water blue, genuine and grounded)
  { type: "like", Icon: ThumbsUp, label: "Like", activeColor: "#3B7097" },
];

function getReactionDef(type: ReactionType) {
  return REACTION_DEFS.find((r) => r.type === type) ?? REACTION_DEFS[0];
}

/* ── Reaction Picker Bubble ───────────────────────────────────────── */

function ReactionPicker({
  visible,
  onSelect,
  onClose,
  colors,
  anchorY = 300,
}: {
  visible: boolean;
  onSelect: (type: ReactionType) => void;
  onClose: () => void;
  colors: ColorPalette;
  anchorY?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconAnims = useRef(
    REACTION_DEFS.map(() => new Animated.Value(0))
  ).current;
  const [animVisible, setAnimVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setAnimVisible(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      iconAnims.forEach((anim, i) => {
        anim.setValue(0);
        Animated.spring(anim, {
          toValue: 1,
          delay: i * 40,
          friction: 5,
          tension: 140,
          useNativeDriver: true,
        }).start();
      });
    } else if (animVisible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => setAnimVisible(false));
    }
  }, [visible]);

  if (!visible && !animVisible) return null;

  const pStyles = pickerStyles(colors);

  return (
    <Modal
      transparent
      visible={visible || animVisible}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      {/* Full-screen backdrop to dismiss on click outside */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="Close reactions"
      />
      <Animated.View
        style={[
          pStyles.pickerBubbleOuter,
          {
            top: Math.max(anchorY - 56, 40),
            left: 16,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <BlurView intensity={65} tint="default" style={pStyles.pickerBlur}>
          {REACTION_DEFS.map((def, i) => (
            <Animated.View
              key={def.type}
              style={{ transform: [{ scale: iconAnims[i] }] }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={def.label}
                onPress={() => onSelect(def.type)}
                style={({ pressed }) => [
                  pStyles.pickerItem,
                  pressed && pStyles.pickerItemPressed,
                ]}
              >
                <def.Icon size={24} color={def.activeColor} fill="none" />
              </Pressable>
            </Animated.View>
          ))}
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const pickerStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    pickerBubbleOuter: {
      position: "absolute",
      borderRadius: 998,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.line,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 10,
    },
    pickerBlur: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: `${colors.surface}B3`,
    },
    pickerItem: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: 998,
      backgroundColor: colors.bg,
    },
    pickerItemPressed: {
      opacity: 0.65,
      transform: [{ scale: 1.15 }],
    },
  });

/* ── Community Reaction Badges (Group 2) ──────────────────────────── */

function CommunityReactionBadges({
  postId,
  colors,
}: {
  postId: string;
  colors: ColorPalette;
}) {
  const { reactionsMap } = useOlive();
  const reactions = reactionsMap[postId];

  if (!reactions) return null;

  const activeTypes = REACTION_DEFS.filter((def) => reactions[def.type] > 0);

  if (activeTypes.length === 0) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {activeTypes.map((def, i) => (
        <View
          key={def.type}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.text,
            borderWidth: 1.5,
            borderColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: i > 0 ? -8 : 0,
            zIndex: activeTypes.length - i,
          }}
        >
          <def.Icon size={13} color={def.activeColor} fill="none" />
        </View>
      ))}
    </View>
  );
}

/* ── PostCard Component ───────────────────────────────────────────── */

export function PostCard({
  post,
  hideAuthor = false,
}: {
  post: Post;
  hideAuthor?: boolean;
}) {
  const { styles, colors } = useThemeStyles(createStyles);
  const {
    isSaved,
    toggleSave,
    closeSearch,
    openExpandedWindow,
    reviewsMap,
    getUserReaction,
    setReaction,
    removeReaction,
    reactionsMap,
  } = useOlive();

  const userReaction = getUserReaction(post.id);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorY, setAnchorY] = useState(300);
  const reactionButtonRef = useRef<View>(null);
  const longPressedRef = useRef(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const reviews = reviewsMap[post.id] ?? REVIEWS[post.id] ?? [];
  const latestReview = reviews.length > 0 ? reviews[0] : null;
  const saved = isSaved(post.id);

  // Compute total reaction count for display
  const postReactions = reactionsMap[post.id];
  const totalReactionCount = postReactions
    ? Object.values(postReactions).reduce((a, b) => a + b, 0)
    : 0;

  // Compute reshare count (deterministic seed from post data)
  const reshareCount = Math.floor(Math.abs(post.lng * 10) % 12);

  const openPlace = () => {
    closeSearch();
    openExpandedWindow({ type: "details", post });
  };

  const openAuthorProfile = () => {
    closeSearch();
    router.push({
      pathname: "/profile",
      params: { author: post.author, id: post.id },
    });
  };

  /* ── Reaction handlers ────────────────────────────────────────── */

  const handleReactionTap = useCallback(() => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    if (userReaction === "heart") {
      removeReaction(post.id);
    } else {
      setReaction(post.id, "heart");
    }
  }, [userReaction, post.id]);

  const handlePressIn = useCallback((e: any) => {
    longPressedRef.current = false;
    const py = e?.nativeEvent?.pageY;
    if (typeof py === "number" && py > 0) {
      setAnchorY(py);
    }
  }, []);

  const handleLongPress = useCallback(() => {
    longPressedRef.current = true;
    if (reactionButtonRef.current) {
      reactionButtonRef.current.measureInWindow((_x, y) => {
        if (typeof y === "number" && y > 0) {
          setAnchorY(y);
        }
        setPickerVisible(true);
      });
    } else {
      setPickerVisible(true);
    }
  }, []);

  const handlePickerSelect = useCallback(
    (type: ReactionType) => {
      if (userReaction === type) {
        removeReaction(post.id);
      } else {
        setReaction(post.id, type);
      }
      setPickerVisible(false);
    },
    [userReaction, post.id]
  );

  const handleShare = () => {
    Share.share({
      message: `${post.title} — ${post.author} (${post.place}) on Olive!`,
    });
  };

  /* ── Determine which icon to show for the reaction button ────── */
  const currentReactionDef = userReaction
    ? getReactionDef(userReaction)
    : REACTION_DEFS[0];
  const ReactionIcon = currentReactionDef.Icon;

  return (
    <View style={styles.card}>
      {/* Author Header */}
      {!hideAuthor && (
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${post.author}'s profile`}
            onPress={openAuthorProfile}
            style={styles.authorGroup}
          >
            <View style={styles.avatarCircle}>
              {post.image ? (
                <Image source={post.image} style={styles.avatarPhoto} />
              ) : (
                <Text style={styles.avatarLetter}>{post.author[0]}</Text>
              )}
            </View>
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.authorSub}>
                {post.kind} · {post.category} · {post.distanceKm} km
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Image */}
      <Pressable
        accessibilityRole="button"
        onPress={openPlace}
        style={styles.imageWrap}
      >
        <Image source={post.image} style={styles.postImage} />
      </Pressable>

      {/* ═══ Social Action Bar — 2 Groups with justify-between ═══ */}
      <View style={styles.actionBar}>
        {/* Group 1: Reactions + Comments + Reshare (all with counts) */}
        <View style={styles.actionsGroup}>
          {/* Reaction button */}
          <View ref={reactionButtonRef} style={{ position: "relative" }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                userReaction
                  ? `Reacted with ${currentReactionDef.label}. Tap to remove, long press for more`
                  : "React. Long press for more reactions"
              }
              onPress={handleReactionTap}
              onPressIn={handlePressIn}
              onLongPress={handleLongPress}
              delayLongPress={350}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && styles.pressed,
              ]}
            >
              <ReactionIcon
                size={20}
                color={
                  userReaction ? currentReactionDef.activeColor : colors.text
                }
                fill={userReaction ? currentReactionDef.activeColor : "none"}
              />
              {totalReactionCount > 0 && (
                <Text style={styles.actionCount}>{totalReactionCount}</Text>
              )}
            </Pressable>

            {/* Reaction Picker Popup */}
            <ReactionPicker
              visible={pickerVisible}
              onSelect={handlePickerSelect}
              onClose={() => setPickerVisible(false)}
              colors={colors}
              anchorY={anchorY}
            />
          </View>

          {/* Comments */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${reviews.length} comments`}
            onPress={() => openExpandedWindow({ type: "comments", post })}
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.pressed,
            ]}
          >
            <MessageCircle size={20} color={colors.text} />
            {reviews.length > 0 && (
              <Text style={styles.actionCount}>{reviews.length}</Text>
            )}
          </Pressable>

          {/* Reshare */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reshare"
            onPress={handleShare}
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.pressed,
            ]}
          >
            <Repeat2 size={20} color={colors.text} />
            {reshareCount > 0 && (
              <Text style={styles.actionCount}>{reshareCount}</Text>
            )}
          </Pressable>
        </View>

        {/* Group 2: Community Reaction Badges (icons only, no count) */}
        <CommunityReactionBadges postId={post.id} colors={colors} />
      </View>

      {/* Editorial Post Content & Story Narrative */}
      <View style={styles.postBodySection}>
        {/* Drop Headline */}
        <Pressable onPress={openPlace} style={styles.titleWrap}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {post.title}
          </Text>
        </Pressable>

        {/* Narrative Caption */}
        <Pressable
          onPress={() => setCaptionExpanded((prev) => !prev)}
          style={styles.captionWrap}
        >
          <Text
            style={styles.captionText}
            numberOfLines={captionExpanded ? undefined : 2}
          >
            <Text style={styles.captionAuthor}>{post.author} </Text>
            {post.body}
          </Text>
          {post.body.length > 85 && !captionExpanded && (
            <Text style={styles.captionMore}>more</Text>
          )}
        </Pressable>

        {/* Venue Capsule & Details Trigger */}
        <View style={styles.venueRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Location: ${post.place}`}
            onPress={openPlace}
            style={styles.venueCapsule}
          >
            <MapPin size={12} color={colors.signal} />
            <Text numberOfLines={1} style={styles.venueCapsuleText}>
              {post.place}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open details sheet"
            onPress={() => openExpandedWindow({ type: "details", post })}
            style={styles.detailsChip}
          >
            <Text style={styles.detailsChipText}>Details</Text>
            <ChevronRight size={11} color={colors.muted} />
          </Pressable>
        </View>

        {/* Community Review Highlight */}
        {latestReview && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Community review from ${latestReview.by}`}
            onPress={() => openExpandedWindow({ type: "comments", post })}
            style={styles.reviewHighlight}
          >
            <Text numberOfLines={1} style={styles.reviewQuote}>
              <Text style={styles.reviewAuthorPrefix}>{latestReview.by}: </Text>
              &ldquo;{latestReview.text}&rdquo;
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────── */

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      marginBottom: 36,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 8,
    },
    authorGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    avatarCircle: {
      width: 48,
      height: 48,
      borderRadius: 32,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceMuted,
    },
    avatarPhoto: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    avatarLetter: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    authorMeta: {
      flex: 1,
    },
    authorName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    authorSub: {
      fontSize: 12,
      marginTop: 2,
      color: colors.muted,
    },
    imageWrap: {
      width: "100%",
      aspectRatio: POST_MEDIA_ASPECT_RATIO,
      borderRadius: 32,
      overflow: "hidden",
      position: "relative",
    },
    postImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    /* ── Action Bar: 2 groups, space-between ── */
    actionBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 4,
    },
    actionsGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      height: 32,
      borderRadius: 9999,
      borderWidth: 1,
      backgroundColor: "#E6CDBA50",
      borderColor: "#E6CDBA",
    },
    actionCount: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    pressed: {
      opacity: 0.65,
    },
    postBodySection: {
      paddingTop: 8,
      gap: 4,
    },
    titleWrap: {
      paddingVertical: 2,
    },
    postTitle: {
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 20,
      color: colors.text,
    },
    captionWrap: {
      paddingVertical: 2,
    },
    captionText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    captionAuthor: {
      fontWeight: "700",
      color: colors.text,
    },
    captionMore: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.muted,
    },
    venueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingTop: 4,
    },
    venueCapsule: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: 1,
      flexShrink: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    venueCapsuleText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    detailsChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    detailsChipText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    reviewHighlight: {
      borderLeftWidth: 2,
      paddingLeft: 8,
      paddingVertical: 2,
      marginTop: 4,
      borderLeftColor: colors.signal,
    },
    reviewQuote: {
      fontSize: 12,
      fontStyle: "italic",
      lineHeight: 16,
      color: colors.muted,
    },
    reviewAuthorPrefix: {
      fontWeight: "700",
      fontStyle: "normal",
      color: colors.text,
    },
  });

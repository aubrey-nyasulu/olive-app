import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Line, Pattern, Rect } from "react-native-svg";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MapPin,
  ChevronRight,
  Repeat2,
  MoreHorizontal,
} from "lucide-react-native";
import { router } from "expo-router";
import type { Post, ReactionType } from "../models";
import { REVIEWS } from "../places";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";
import { useMorphTrigger } from "./popup/MorphTrigger";
import { getReactionDef, REACTION_DEFS } from "./popup/PostPopupViews";

export const POST_MEDIA_ASPECT_RATIO = 1;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
                  { backgroundColor: def.activeColor },
                  pressed && pStyles.pickerItemPressed,
                ]}
              >
                <def.Icon size={24} color="#FFFFFF" fill="none" />
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
      // backgroundColor: colors.bg,
    },
    pickerItemPressed: {
      opacity: 0.65,
      transform: [{ scale: 1.15 }],
    },
  });

/* ── Animated Reaction Carousel (Cycles distinct types when > 3) ──── */

function AnimatedReactionCarousel({
  activeTypes,
  colors,
}: {
  activeTypes: typeof REACTION_DEFS;
  colors: ColorPalette;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentStep = useRef(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const activeKey = activeTypes.map((t) => t.type).join(",");
  const N = activeTypes.length;

  useEffect(() => {
    if (N <= 3) return;

    currentStep.current = 0;
    translateX.setValue(0);

    let timeoutId: ReturnType<typeof setTimeout>;

    const step = () => {
      timeoutId = setTimeout(() => {
        if (!isMounted.current) return;

        const nextStep = currentStep.current + 1;
        const targetValue = -nextStep * 18;

        Animated.timing(translateX, {
          toValue: targetValue,
          duration: 450,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished || !isMounted.current) return;

          if (nextStep >= N) {
            // Completed a full cycle: reset instantly to 0 with zero visual change
            // because items [N, N+1, N+2] are identical to items [0, 1, 2]
            translateX.setValue(0);
            currentStep.current = 0;
          } else {
            currentStep.current = nextStep;
          }

          // Schedule next step in the loop
          step();
        });
      }, 2500);
    };

    step();

    return () => {
      clearTimeout(timeoutId);
      translateX.stopAnimation();
    };
  }, [activeKey, N]);

  // Repeat the first 3 items so the loop finishes seamlessly at -18 * N
  const items = [...activeTypes, ...activeTypes.slice(0, 3)];

  return (
    <View
      style={{
        width: 62,
        height: 26,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          transform: [{ translateX }],
        }}
      >
        {items.map((def, i) => {
          const base = -i * 18;
          // Opacity interpolation:
          // - fades out when sliding past slot 0 to the left (base - 18 to base)
          // - fully visible in slots 0, 1, 2 (base to base + 36)
          // - fades in when sliding into slot 2 from the right (base + 36 to base + 54)
          // - invisible (opacity 0) outside the active window
          const opacity = translateX.interpolate({
            inputRange: [base - 18, base, base + 36, base + 54],
            outputRange: [0, 1, 1, 0],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={`${def.type}-${i}`}
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: colors.actionPillBg,
                borderWidth: 1.5,
                borderColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: i > 0 ? -8 : 0,
                zIndex: items.length - i,
                opacity,
              }}
            >
              <def.Icon size={13} color={def.activeColor} fill="none" />
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

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

  // Filter to reaction types that have at least 1 reaction, sorted by popularity
  const activeTypes = REACTION_DEFS.filter(
    (def) => (reactions[def.type] ?? 0) > 0
  ).sort((a, b) => (reactions[b.type] ?? 0) - (reactions[a.type] ?? 0));

  if (activeTypes.length === 0) return null;

  // If more than 3 distinct reaction types, cycle them with carousel animation
  if (activeTypes.length > 3) {
    return (
      <AnimatedReactionCarousel activeTypes={activeTypes} colors={colors} />
    );
  }

  // 1 to 3 distinct types: static display with no overflow badge
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {activeTypes.map((def, i) => (
        <View
          key={def.type}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.actionPillBg,
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

/* ── Reaction Summary Text ("User and 44 others reacted") ─────────── */

function ReactionSummary({
  postId,
  postAuthor,
  otherReactorsCount,
  hasUserReacted,
  colors,
}: {
  postId: string;
  postAuthor: string;
  otherReactorsCount: number;
  hasUserReacted: boolean;
  colors: ColorPalette;
}) {
  if (otherReactorsCount <= 0) return null;

  const candidateNames = [
    "Kondwani Banda",
    "Dalitso Phiri",
    "Puma Energy",
    "Chisomo Banda",
    "Tamanda Gondwe",
    "Lingadzi Sessions",
    "Mabu Artisan Bakes",
  ].filter((name) => name !== postAuthor);

  const hash = Math.abs(
    postId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );
  const leadUser = candidateNames[hash % candidateNames.length];

  const bold = { fontWeight: "700" as const, color: colors.text };
  const remainingOthers = otherReactorsCount - 1;
  const othersText =
    remainingOthers === 1 ? "1 other" : `${remainingOthers} others`;

  if (hasUserReacted) {
    if (otherReactorsCount === 1) {
      return (
        <Text>
          <Text style={bold}>{leadUser}</Text> also reacted
        </Text>
      );
    }
    return (
      <Text>
        <Text style={bold}>{leadUser}</Text> and{" "}
        <Text style={bold}>{othersText}</Text> also reacted
      </Text>
    );
  }

  // Current user has not reacted
  if (otherReactorsCount === 1) {
    return (
      <Text>
        <Text style={bold}>{leadUser}</Text> reacted
      </Text>
    );
  }
  return (
    <Text>
      <Text style={bold}>{leadUser}</Text> and{" "}
      <Text style={bold}>{othersText}</Text> reacted
    </Text>
  );
}

/* ── Diagonal-Striped Repost Frame ───────────────────────────────── */

function RepostStripedFrame({
  colors,
  children,
}: {
  colors: ColorPalette;
  children: ReactNode;
}) {
  const rawId = useId();
  const patternId = `repost-stripe-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <View style={stripedStyles.frame}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern
              id={patternId}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-45)"
            >
              <Line
                x1="12"
                y1="0"
                x2="12"
                y2="24"
                stroke={colors.repostStripe}
                strokeWidth="1"
              />
            </Pattern>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#${patternId})`}
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const stripedStyles = StyleSheet.create({
  frame: {
    width: "100%",
    borderRadius: 32,
    overflow: "hidden",
    padding: 16,
    paddingRight: 0,
    marginBottom: 4,
    position: "relative",
  },
});

/* ── Artistic No-Photo Text Card ─────────────────────────────────── */

function NoPhotoEditorialCard({
  post,
  colors,
  embedded = false,
  triggerRef,
  isMorphedOut = false,
  onPress,
}: {
  post: Post;
  colors: ColorPalette;
  embedded?: boolean;
  triggerRef?: RefObject<View | null>;
  isMorphedOut?: boolean;
  onPress: () => void;
}) {
  const nStyles = noPhotoStyles(colors, embedded);

  return (
    <Pressable
      ref={triggerRef}
      collapsable={false}
      accessibilityRole="button"
      accessibilityLabel={`Open ${post.place} details`}
      onPress={onPress}
      style={({ pressed }) => [
        nStyles.outer,
        pressed && { opacity: 0.92 },
        isMorphedOut && { opacity: 0 },
      ]}
    >
      <LinearGradient
        colors={[colors.surface, colors.surfaceMuted, colors.actionPillBg]}
        locations={[0, 0.58, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={nStyles.gradient}
      >
        {/* Subtle organic contour lines & warm glow accents */}
        <View pointerEvents="none" style={nStyles.decorTopRight}>
          <Svg width="180" height="180" viewBox="0 0 180 180">
            <Circle
              cx="154"
              cy="24"
              r="42"
              stroke={colors.signal}
              strokeOpacity={0.14}
              strokeWidth="1"
              fill="none"
            />
            <Circle
              cx="154"
              cy="24"
              r="76"
              stroke={colors.signal}
              strokeOpacity={0.09}
              strokeWidth="1"
              fill="none"
            />
            <Circle
              cx="154"
              cy="24"
              r="112"
              stroke={colors.line}
              strokeOpacity={0.7}
              strokeWidth="1"
              fill="none"
            />
          </Svg>
        </View>

        <View pointerEvents="none" style={nStyles.decorBottomLeft}>
          <Svg width="140" height="120" viewBox="0 0 140 120">
            <Circle
              cx="16"
              cy="108"
              r="48"
              stroke={colors.signal}
              strokeOpacity={0.08}
              strokeWidth="1"
              fill="none"
            />
            <Circle
              cx="16"
              cy="108"
              r="82"
              stroke={colors.line}
              strokeOpacity={0.55}
              strokeWidth="1"
              fill="none"
            />
          </Svg>
        </View>

        <View style={nStyles.bodyWrap}>
          <View style={nStyles.accentMark} />
          <Text style={nStyles.bodyText}>{post.body}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const noPhotoStyles = (colors: ColorPalette, embedded: boolean) =>
  StyleSheet.create({
    outer: {
      width: "100%",
      borderRadius: embedded ? 24 : 32,
      borderWidth: 1,
      borderColor: colors.line,
      overflow: "hidden",
    },
    gradient: {
      paddingHorizontal: embedded ? 20 : 24,
      paddingVertical: embedded ? 22 : 28,
      minHeight: embedded ? 156 : 188,
      justifyContent: "center",
      position: "relative",
    },
    decorTopRight: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 180,
      height: 180,
    },
    decorBottomLeft: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 140,
      height: 120,
    },
    bodyWrap: {
      gap: 14,
    },
    accentMark: {
      width: 24,
      height: 2.5,
      borderRadius: 2,
      backgroundColor: colors.signal,
      opacity: 0.85,
    },
    bodyText: {
      fontSize: embedded ? 16 : 18,
      fontWeight: "500",
      lineHeight: embedded ? 24 : 27,
      letterSpacing: -0.2,
      color: colors.text,
    },
  });

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
    openPopup,
    reviewsMap,
    getUserReaction,
    setReaction,
    removeReaction,
    reactionsMap,
    isReposted,
    getUserQuoteNote,
  } = useOlive();

  const instanceId = useId();
  const userReaction = getUserReaction(post.id);
  const userReposted = isReposted(post.id);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorY, setAnchorY] = useState(300);
  const reactionButtonRef = useRef<View>(null);
  const longPressedRef = useRef(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  // Morph triggers for every non-dock pressable
  const imageTriggerId = `post-${post.id}-${instanceId}-image`;
  const noPhotoTriggerId = `post-${post.id}-${instanceId}-nophoto`;
  const commentsTriggerId = `post-${post.id}-${instanceId}-comments`;
  const reviewTriggerId = `post-${post.id}-${instanceId}-review`;
  const detailsTriggerId = `post-${post.id}-${instanceId}-details`;
  const venueTriggerId = `post-${post.id}-${instanceId}-venue`;
  const moreTriggerId = `post-${post.id}-${instanceId}-more`;
  const reshareTriggerId = `post-${post.id}-${instanceId}-reshare`;
  const reactionsTriggerId = `post-${post.id}-${instanceId}-reactions`;

  const imageTrigger = useMorphTrigger(imageTriggerId);
  const noPhotoTrigger = useMorphTrigger(noPhotoTriggerId);
  const commentsTrigger = useMorphTrigger(commentsTriggerId);
  const reviewTrigger = useMorphTrigger(reviewTriggerId);
  const detailsTrigger = useMorphTrigger(detailsTriggerId);
  const venueTrigger = useMorphTrigger(venueTriggerId);
  const moreTrigger = useMorphTrigger(moreTriggerId);
  const reshareTrigger = useMorphTrigger(reshareTriggerId);
  const reactionsTrigger = useMorphTrigger(reactionsTriggerId);

  // Resolve & track natural image dimensions so clicked image scales to its original aspect/size
  const getInitialNaturalDims = () => {
    const resolved = post.image
      ? (Image as any).resolveAssetSource?.(post.image)
      : null;
    if (resolved?.width && resolved?.height) {
      return { width: resolved.width, height: resolved.height };
    }
    if (post.ratio === "4/3") return { width: 1200, height: 900 };
    if (post.ratio === "4/5") return { width: 960, height: 1200 };
    return { width: 1200, height: 1200 };
  };
  const naturalDimsRef = useRef<{ width: number; height: number }>(
    getInitialNaturalDims()
  );

  const reviews = reviewsMap[post.id] ?? REVIEWS[post.id] ?? [];
  const latestReview = reviews.length > 0 ? reviews[0] : null;
  const saved = isSaved(post.id);

  const isInstantRepost = Boolean(post.repostedBy && !post.quoteNote);
  const isQuoteRepost = Boolean(post.repostedBy && post.quoteNote);
  const isAnyRepost = isInstantRepost || isQuoteRepost;

  // Compute total reaction count for display
  const postReactions = reactionsMap[post.id];
  const totalReactionCount = postReactions
    ? Object.values(postReactions).reduce((a, b) => a + b, 0)
    : 0;

  // Number of community members who reacted (excluding current user)
  const otherReactorsCount = userReaction
    ? Math.max(0, totalReactionCount - 1)
    : totalReactionCount;

  // Compute reshare count (deterministic seed from post data + active repost state)
  const baseReshareCount =
    Math.floor(Math.abs(post.lng * 10) % 12) + (post.repostedBy ? 1 : 0);
  const reshareCount =
    baseReshareCount + (userReposted && !post.repostedBy ? 1 : 0);

  const openProfileByName = (name: string) => {
    closeSearch();
    router.push({
      pathname: "/profile",
      params: { author: name, id: post.id },
    });
  };

  const openAuthorProfile = () => openProfileByName(post.author);

  /* ── Morphing Pop-Up Openers ──────────────────────────────────── */

  const handleOpenImage = (embedded: boolean) => {
    if (!post.image) return;
    imageTrigger.measureAndOpen((rect) =>
      openPopup(
        {
          type: "image_viewer",
          image: post.image!,
          naturalWidth: naturalDimsRef.current.width,
          naturalHeight: naturalDimsRef.current.height,
          place: post.place,
          author: post.author,
        },
        {
          triggerId: imageTriggerId,
          rect,
          style: {
            borderRadius: embedded ? 24 : 32,
            backgroundColor: colors.surfaceMuted,
            borderColor: "transparent",
            borderWidth: 0,
          },
        }
      )
    );
  };

  const handleOpenNoPhotoDetails = (embedded: boolean) => {
    noPhotoTrigger.measureAndOpen((rect) =>
      openPopup(
        { type: "details", post },
        {
          triggerId: noPhotoTriggerId,
          rect,
          style: {
            borderRadius: embedded ? 24 : 32,
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 1,
          },
          headerMorph: {
            headerTitle: post.place,
            headerSubtitle: `${post.author} · ${post.category} · ${post.distanceKm} km`,
          },
        }
      )
    );
  };

  const handleOpenDetailsPill = () => {
    detailsTrigger.measureAndOpen((rect) =>
      openPopup(
        { type: "details", post },
        {
          triggerId: detailsTriggerId,
          rect,
          style: {
            borderRadius: 16,
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.line,
            borderWidth: 1,
          },
          headerMorph: {
            title: {
              text: "Details",
              x: 9,
              y: 5,
              fontSize: 12,
              fontWeight: "600",
              color: colors.textSecondary,
            },
            headerSubtitle: `${post.author} · ${post.category} · ${post.distanceKm} km`,
            ghostContent: (
              <View style={styles.ghostDetailsRight}>
                <ChevronRight size={11} color={colors.muted} />
              </View>
            ),
          },
        }
      )
    );
  };

  const handleOpenVenue = () => {
    venueTrigger.measureAndOpen((rect) =>
      openPopup(
        { type: "details", post },
        {
          triggerId: venueTriggerId,
          rect,
          style: {
            borderRadius: 16,
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.line,
            borderWidth: 1,
          },
          headerMorph: {
            icon: {
              render: (c, s) => <MapPin size={s} color={c} />,
              x: 9,
              y: 6,
              size: 12,
              color: colors.signal,
              targetBgColor: colors.signalLight,
            },
            headerTitle: post.place,
            headerSubtitle: `${post.author} · ${post.category} · ${post.distanceKm} km`,
          },
        }
      )
    );
  };

  const handleOpenComments = () => {
    commentsTrigger.measureAndOpen((rect) =>
      openPopup(
        { type: "comments", post },
        {
          triggerId: commentsTriggerId,
          rect,
          style: {
            borderRadius: 16,
            backgroundColor: colors.actionPillBg,
            borderColor: colors.actionPillBorder,
            borderWidth: 1,
          },
          headerMorph: {
            icon: {
              render: (c, s) => <MessageCircle size={s} color={c} />,
              x: 9,
              y: 6,
              size: 20,
              color: colors.text,
              targetBgColor: colors.surfaceMuted,
            },
            headerTitle: "Reviews & Comments",
            headerSubtitle: `${post.author} · ${post.place}`,
            ghostContent:
              reviews.length > 0 ? (
                <View style={styles.ghostPillCountWrap}>
                  <Text style={styles.actionCount}>{reviews.length}</Text>
                </View>
              ) : undefined,
          },
        }
      )
    );
  };

  const handleOpenReviewHighlight = () => {
    reviewTrigger.measureAndOpen((rect) =>
      openPopup(
        { type: "comments", post },
        {
          triggerId: reviewTriggerId,
          rect,
          style: {
            borderRadius: 8,
            backgroundColor: colors.surface,
            borderColor: colors.signal,
            borderWidth: 1,
          },
          headerMorph: {
            headerTitle: "Reviews & Comments",
            headerSubtitle: `${post.author} · ${post.place}`,
          },
        }
      )
    );
  };

  const handleOpenMoreOptions = () => {
    moreTrigger.measureAndOpen((rect) =>
      openPopup(
        { type: "post_options", post },
        {
          triggerId: moreTriggerId,
          rect,
          style: {
            borderRadius: 16,
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.line,
            borderWidth: 1,
          },
          headerMorph: {
            icon: {
              render: (c, s) => <MoreHorizontal size={s} color={c} />,
              x: 6,
              y: 6,
              size: 20,
              color: colors.textSecondary,
              targetBgColor: colors.surfaceMuted,
            },
            headerTitle: "Post Options",
            headerSubtitle: `${post.author} · ${post.place}`,
          },
        }
      )
    );
  };

  const handleOpenReshare = () => {
    reshareTrigger.measureAndOpen((rect) =>
      openPopup(
        { type: "reshare", post },
        {
          triggerId: reshareTriggerId,
          rect,
          style: {
            borderRadius: 16,
            backgroundColor: colors.actionPillBg,
            borderColor: colors.actionPillBorder,
            borderWidth: 1,
          },
          headerMorph: {
            icon: {
              render: (c, s) => <Repeat2 size={s} color={c} />,
              x: 9,
              y: 6,
              size: 20,
              color: userReposted ? colors.signal : colors.text,
              targetBgColor: userReposted
                ? colors.signalLight
                : colors.surfaceMuted,
            },
            headerTitle: "Reshare Post",
            headerSubtitle: `${post.author} · ${post.place}`,
            ghostContent:
              reshareCount > 0 ? (
                <View style={styles.ghostPillCountWrap}>
                  <Text
                    style={[
                      styles.actionCount,
                      userReposted && { color: colors.signal },
                    ]}
                  >
                    {reshareCount}
                  </Text>
                </View>
              ) : undefined,
          },
        }
      )
    );
  };

  const handleOpenReactionsList = () => {
    reactionsTrigger.measureAndOpen((rect) =>
      openPopup(
        {
          type: "reactions_list",
          postId: post.id,
          postAuthor: post.author,
        },
        {
          triggerId: reactionsTriggerId,
          rect,
          style: {
            borderRadius: 14,
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 1,
          },
          headerMorph: {
            headerTitle: "Reactions",
            headerSubtitle: post.author,
          },
        }
      )
    );
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

  /* ── Determine which icon to show for the reaction button ────── */
  const currentReactionDef = userReaction
    ? getReactionDef(userReaction)
    : REACTION_DEFS[0];
  const ReactionIcon = currentReactionDef.Icon;

  const moreButton = (
    <Pressable
      ref={moreTrigger.triggerRef}
      collapsable={false}
      accessibilityRole="button"
      accessibilityLabel="More options"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={handleOpenMoreOptions}
      style={({ pressed }) => [
        styles.moreButton,
        pressed && styles.pressed,
        moreTrigger.isMorphedOut && styles.morphedOut,
      ]}
    >
      <MoreHorizontal size={20} color={colors.textSecondary} />
    </Pressable>
  );

  const renderOriginalAuthorHeader = (withMoreButton: boolean) => (
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
          <Text numberOfLines={1} style={styles.authorName}>
            {post.author}
          </Text>
          <Text numberOfLines={1} style={styles.authorSub}>
            {post.kind} · {post.category} · {post.distanceKm} km
          </Text>
        </View>
      </Pressable>

      {withMoreButton && moreButton}
    </View>
  );

  const renderMedia = (embedded: boolean) =>
    post.image ? (
      <Pressable
        ref={imageTrigger.triggerRef}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel={`View ${post.place} photo`}
        onPress={() => handleOpenImage(embedded)}
        style={[
          styles.imageWrap,
          embedded && styles.embeddedImageWrap,
          imageTrigger.isMorphedOut && styles.morphedOut,
        ]}
      >
        <Image
          source={post.image}
          style={styles.postImage}
          onLoad={(e) => {
            const src = (e.nativeEvent as any)?.source;
            const target = (e.nativeEvent as any)?.target;
            const w = src?.width ?? target?.naturalWidth;
            const h = src?.height ?? target?.naturalHeight;
            if (typeof w === "number" && typeof h === "number" && w > 0 && h > 0) {
              naturalDimsRef.current = { width: w, height: h };
            }
          }}
        />
      </Pressable>
    ) : (
      <NoPhotoEditorialCard
        post={post}
        colors={colors}
        embedded={embedded}
        triggerRef={noPhotoTrigger.triggerRef}
        isMorphedOut={noPhotoTrigger.isMorphedOut}
        onPress={() => handleOpenNoPhotoDetails(embedded)}
      />
    );

  const renderPostBody = (embedded: boolean) => (
    <View
      style={[
        styles.postBodySection,
        embedded && styles.embeddedPostBodySection,
      ]}
    >
      {/* Narrative Caption (omitted for no-photo posts since body is already the centerpiece card) */}
      {Boolean(post.image) && (
        <Pressable
          onPress={() => setCaptionExpanded((prev) => !prev)}
          style={styles.captionWrap}
        >
          <Text
            style={styles.captionText}
            numberOfLines={captionExpanded ? undefined : 2}
          >
            {post.body}
          </Text>
          {post.body.length > 85 && !captionExpanded && (
            <Text style={styles.captionMore}>more</Text>
          )}
        </Pressable>
      )}

      {/* Venue Capsule & Details Trigger */}
      <View style={styles.venueRow}>
        <Pressable
          ref={venueTrigger.triggerRef}
          collapsable={false}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${post.place}`}
          onPress={handleOpenVenue}
          style={[
            styles.venueCapsule,
            venueTrigger.isMorphedOut && styles.morphedOut,
          ]}
        >
          <MapPin size={12} color={colors.signal} />
          <Text numberOfLines={1} style={styles.venueCapsuleText}>
            {post.place}
          </Text>
        </Pressable>

        <Pressable
          ref={detailsTrigger.triggerRef}
          collapsable={false}
          accessibilityRole="button"
          accessibilityLabel="Open details sheet"
          onPress={handleOpenDetailsPill}
          style={[
            styles.detailsChip,
            detailsTrigger.isMorphedOut && styles.morphedOut,
          ]}
        >
          <Text style={styles.detailsChipText}>Details</Text>
          <ChevronRight size={11} color={colors.muted} />
        </Pressable>
      </View>

      {/* Community Review Highlight */}
      {latestReview && (
        <Pressable
          ref={reviewTrigger.triggerRef}
          collapsable={false}
          accessibilityRole="button"
          accessibilityLabel={`Community review from ${latestReview.by}`}
          onPress={handleOpenReviewHighlight}
          style={[
            styles.reviewHighlight,
            reviewTrigger.isMorphedOut && styles.morphedOut,
          ]}
        >
          <Text numberOfLines={1} style={styles.reviewQuote}>
            <Text style={styles.reviewAuthorPrefix}>{latestReview.by}: </Text>
            &ldquo;{latestReview.text}&rdquo;
          </Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.card}>
      {/* LinkedIn-Style Instant Repost Banner */}
      {isInstantRepost && post.repostedBy && (
        <View style={styles.repostBanner}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${post.repostedBy.name}'s profile`}
            onPress={() => openProfileByName(post.repostedBy!.name)}
            style={({ pressed }) => [
              styles.repostBannerLeft,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.repostMiniAvatar}>
              <Text style={styles.repostMiniAvatarText}>
                {getInitials(post.repostedBy.name)}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.repostBannerText}>
              <Text style={styles.repostBannerAuthor}>
                {post.repostedBy.name}
              </Text>{" "}
              reposted this
            </Text>
          </Pressable>
          {moreButton}
        </View>
      )}

      {/* Quote Repost Header (Reposter's Own Header) */}
      {isQuoteRepost && post.repostedBy && (
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${post.repostedBy.name}'s profile`}
            onPress={() => openProfileByName(post.repostedBy!.name)}
            style={styles.authorGroup}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {getInitials(post.repostedBy.name)}
              </Text>
            </View>
            <View style={styles.authorMeta}>
              <Text numberOfLines={1} style={styles.authorName}>
                {post.repostedBy.name}
              </Text>
              <Text numberOfLines={1} style={styles.authorSub}>
                {post.repostedBy.role || post.repostedBy.time || "Reposted"}
              </Text>
            </View>
          </Pressable>
          {moreButton}
        </View>
      )}

      {/* Normal Post Author Header */}
      {!isAnyRepost && !hideAuthor && renderOriginalAuthorHeader(true)}

      {/* Media or Embedded Repost Container */}
      {isAnyRepost ? (
        <>
          {isQuoteRepost && post.quoteNote && (
            <Text style={styles.quoteRepostCommentary}>{post.quoteNote}</Text>
          )}
          <RepostStripedFrame colors={colors}>
            <View style={styles.innerOriginalPost}>
              {renderOriginalAuthorHeader(false)}
              {renderMedia(true)}
              {renderPostBody(true)}
            </View>
          </RepostStripedFrame>
        </>
      ) : (
        renderMedia(false)
      )}

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
            ref={commentsTrigger.triggerRef}
            collapsable={false}
            accessibilityRole="button"
            accessibilityLabel={`View ${reviews.length} comments`}
            onPress={handleOpenComments}
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.pressed,
              commentsTrigger.isMorphedOut && styles.morphedOut,
            ]}
          >
            <MessageCircle size={20} color={colors.text} />
            {reviews.length > 0 && (
              <Text style={styles.actionCount}>{reviews.length}</Text>
            )}
          </Pressable>

          {/* Reshare */}
          <Pressable
            ref={reshareTrigger.triggerRef}
            collapsable={false}
            accessibilityRole="button"
            accessibilityLabel="Reshare options"
            onPress={handleOpenReshare}
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.pressed,
              reshareTrigger.isMorphedOut && styles.morphedOut,
            ]}
          >
            <Repeat2
              size={20}
              color={userReposted ? colors.signal : colors.text}
            />
            {reshareCount > 0 && (
              <Text
                style={[
                  styles.actionCount,
                  userReposted && { color: colors.signal },
                ]}
              >
                {reshareCount}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Group 2: Save / Bookmark Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove bookmark" : "Save place"}
          onPress={() => toggleSave(post.id)}
          style={({ pressed }) => [
            styles.actionItem,
            pressed && styles.pressed,
          ]}
        >
          <Bookmark
            size={20}
            color={saved ? colors.signal : colors.text}
            fill={saved ? colors.signal : "none"}
          />
        </Pressable>
      </View>

      {/* Social Proof Row: Badges + Reaction Names Text */}
      {otherReactorsCount > 0 && (
        <Pressable
          ref={reactionsTrigger.triggerRef}
          collapsable={false}
          accessibilityRole="button"
          accessibilityLabel="View community reactions"
          onPress={handleOpenReactionsList}
          style={({ pressed }) => [
            styles.socialProofRow,
            pressed && { opacity: 0.7 },
            reactionsTrigger.isMorphedOut && styles.morphedOut,
          ]}
        >
          <CommunityReactionBadges postId={post.id} colors={colors} />
          <Text style={styles.reactionSummaryText} numberOfLines={2}>
            <ReactionSummary
              postId={post.id}
              postAuthor={post.author}
              otherReactorsCount={otherReactorsCount}
              hasUserReacted={!!userReaction}
              colors={colors}
            />
          </Text>
        </Pressable>
      )}

      {/* Editorial Post Content & Story Narrative (for non-repost posts) */}
      {!isAnyRepost && renderPostBody(false)}
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────── */

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      marginBottom: 36,
    },
    repostBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingHorizontal: 4,
      paddingBottom: 10,
    },
    repostBannerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
      minWidth: 0,
    },
    repostMiniAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.line,
      alignItems: "center",
      justifyContent: "center",
    },
    repostMiniAvatarText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.text,
    },
    repostBannerText: {
      fontSize: 12.5,
      color: colors.muted,
      flexShrink: 1,
    },
    repostBannerAuthor: {
      color: colors.text,
      fontWeight: "700",
    },
    quoteRepostCommentary: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      marginBottom: 12,
    },
    innerOriginalPost: {
      backgroundColor: colors.bg,
      borderRadius: 20,
      padding: 8,
      paddingRight: 0,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 8,
      gap: 10,
    },
    moreButton: {
      padding: 6,
      marginRight: -4,
      borderRadius: 9999,
      alignItems: "center",
      justifyContent: "center",
    },
    authorGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
      minWidth: 0,
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
      minWidth: 0,
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
      backgroundColor: colors.surfaceMuted,
    },
    embeddedImageWrap: {
      borderRadius: 24,
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
    socialProofRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingTop: 8,
      paddingBottom: 2,
    },
    reactionSummaryText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
      flex: 1,
      lineHeight: 18,
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
      backgroundColor: colors.actionPillBg,
      borderColor: colors.actionPillBorder,
    },
    actionCount: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    pressed: {
      opacity: 0.65,
    },
    morphedOut: {
      opacity: 0,
    },
    ghostPillCountWrap: {
      height: "100%",
      paddingLeft: 33,
      paddingRight: 8,
      justifyContent: "center",
    },
    ghostDetailsRight: {
      height: "100%",
      paddingRight: 8,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    postBodySection: {
      paddingTop: 4,
      gap: 4,
    },
    embeddedPostBodySection: {
      paddingTop: 8,
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

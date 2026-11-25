import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Line, Pattern, Rect } from "react-native-svg";
import {
  Heart,
  MessageCircle,
  Flower2,
  ThumbsUp,
  Laugh,
  Flame,
  Hand,
  Bookmark,
  MapPin,
  ChevronRight,
  Repeat2,
  MoreHorizontal,
  Share2,
  User,
  Flag,
  X,
  Quote,
  ArrowLeft,
  Trash2,
} from "lucide-react-native";
import { router } from "expo-router";
import type { Post, ReactionType } from "../models";
import { REVIEWS } from "../places";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";

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

/* ── Post Options Menu (Editorial Bottom Sheet) ──────────────────── */

function PostOptionsMenu({
  visible,
  post,
  saved,
  onToggleSave,
  onShare,
  onViewPlace,
  onViewAuthor,
  onClose,
  colors,
}: {
  visible: boolean;
  post: Post;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onViewPlace: () => void;
  onViewAuthor: () => void;
  onClose: () => void;
  colors: ColorPalette;
}) {
  const slideAnim = useRef(new Animated.Value(340)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [animVisible, setAnimVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setAnimVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (animVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 340,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => setAnimVisible(false));
    }
  }, [visible]);

  if (!visible && !animVisible) return null;

  const mStyles = menuStyles(colors);

  const menuActions = [
    {
      id: "save",
      icon: Bookmark,
      label: saved ? "Saved in Collection" : "Save Place",
      subLabel: saved
        ? "Tap to remove from your bookmarks"
        : "Bookmark this spot for later",
      iconColor: saved ? colors.signal : colors.text,
      iconBg: saved ? colors.signalLight : colors.surfaceMuted,
      fillIcon: saved,
      onPress: () => {
        onToggleSave();
        onClose();
      },
    },
    {
      id: "share",
      icon: Share2,
      label: "Share Post",
      subLabel: "Send to friends or copy share link",
      iconColor: colors.text,
      iconBg: colors.surfaceMuted,
      fillIcon: false,
      onPress: () => {
        onClose();
        setTimeout(onShare, 200);
      },
    },
    {
      id: "place",
      icon: MapPin,
      label: "Explore Place Details",
      subLabel: `${post.place} · ${post.distanceKm} km away`,
      iconColor: colors.signal,
      iconBg: colors.surfaceMuted,
      fillIcon: false,
      onPress: () => {
        onClose();
        setTimeout(onViewPlace, 200);
      },
    },
    {
      id: "author",
      icon: User,
      label: `About ${post.author}`,
      subLabel: "View curator profile, guides & stories",
      iconColor: colors.text,
      iconBg: colors.surfaceMuted,
      fillIcon: false,
      onPress: () => {
        onClose();
        setTimeout(onViewAuthor, 200);
      },
    },
    {
      id: "report",
      icon: Flag,
      label: "Report Post",
      subLabel: "Flag inappropriate content or inaccuracies",
      iconColor: colors.error,
      iconBg: `${colors.error}15`,
      fillIcon: false,
      onPress: () => {
        onClose();
      },
    },
  ];

  return (
    <Modal
      transparent
      visible={visible || animVisible}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={mStyles.overlay}>
        {/* Backdrop dismiss */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.overlay, opacity: fadeAnim },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close menu"
          />
        </Animated.View>

        {/* Sliding Menu Sheet */}
        <Animated.View
          style={[
            mStyles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={mStyles.handle} />

          {/* Post Header Summary */}
          <View style={mStyles.header}>
            <View style={mStyles.thumbnailWrap}>
              {post.image ? (
                <Image source={post.image} style={mStyles.thumbnail} />
              ) : (
                <View style={mStyles.thumbnailFallback}>
                  <MapPin size={18} color={colors.signal} />
                </View>
              )}
            </View>
            <View style={mStyles.headerMeta}>
              <Text numberOfLines={1} style={mStyles.headerTitle}>
                {post.place}
              </Text>
              <Text numberOfLines={1} style={mStyles.headerSubtitle}>
                {post.author} · {post.category} · {post.kind}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss options"
              onPress={onClose}
              style={({ pressed }) => [
                mStyles.closeButton,
                pressed && mStyles.pressed,
              ]}
            >
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Action List */}
          <View style={mStyles.actionList}>
            {menuActions.map((item) => {
              const IconComponent = item.icon;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    mStyles.actionRow,
                    pressed && mStyles.actionRowPressed,
                  ]}
                >
                  <View
                    style={[
                      mStyles.iconContainer,
                      { backgroundColor: item.iconBg },
                    ]}
                  >
                    <IconComponent
                      size={18}
                      color={item.iconColor}
                      fill={item.fillIcon ? item.iconColor : "none"}
                    />
                  </View>
                  <View style={mStyles.actionTextCol}>
                    <Text
                      style={[
                        mStyles.actionLabel,
                        item.id === "report" && { color: colors.error },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text numberOfLines={1} style={mStyles.actionSubLabel}>
                      {item.subLabel}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.muted} />
                </Pressable>
              );
            })}
          </View>

          {/* Cancel Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={onClose}
            style={({ pressed }) => [
              mStyles.cancelButton,
              pressed && mStyles.pressed,
            ]}
          >
            <Text style={mStyles.cancelText}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const menuStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: colors.line,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 16,
      maxWidth: 600,
      width: "100%",
      alignSelf: "center",
    },
    handle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
      alignSelf: "center",
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      gap: 12,
    },
    thumbnailWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
    },
    thumbnail: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    thumbnailFallback: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceMuted,
    },
    headerMeta: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.2,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    actionList: {
      paddingVertical: 8,
      gap: 2,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 14,
    },
    actionRowPressed: {
      backgroundColor: colors.surfaceMuted,
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTextCol: {
      flex: 1,
      marginLeft: 12,
    },
    actionLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    actionSubLabel: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 1,
    },
    cancelButton: {
      marginTop: 6,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    pressed: {
      opacity: 0.65,
    },
  });

/* ── Community Reactors Directory ────────────────────────────────── */

const COMMUNITY_REACTORS = [
  {
    name: "Kondwani Banda",
    handle: "@kondwani",
    role: "Coffee & Architecture",
  },
  { name: "Dalitso Phiri", handle: "@dalitso", role: "Local Food Explorer" },
  { name: "Puma Energy", handle: "@pumaenergy", role: "Kenyatta Drive Bay" },
  { name: "Chisomo Banda", handle: "@chisomo", role: "Music & Live Sessions" },
  { name: "Tamanda Gondwe", handle: "@tamanda", role: "Market Gardener" },
  {
    name: "Lingadzi Sessions",
    handle: "@lingadzi",
    role: "Acoustic Arts Community",
  },
  { name: "Mabu Artisan Bakes", handle: "@mabubakes", role: "Artisan Baker" },
  {
    name: "Alinafe Mwale",
    handle: "@alinafe",
    role: "Wildlife & Nature Guide",
  },
  { name: "Tawonga Phiri", handle: "@tawonga", role: "Weekend Cyclist" },
  { name: "Chifundo Banda", handle: "@chifundo", role: "Urban Planner" },
  { name: "Lumbani Chirwa", handle: "@lumbani", role: "Area 10 Resident" },
  {
    name: "Madalitso Nyirenda",
    handle: "@madalitso",
    role: "Culture & Heritage",
  },
  { name: "Sekani Mhone", handle: "@sekani", role: "Specialty Roaster" },
  { name: "Chimwemwe Tembo", handle: "@chimwemwe", role: "Visual Storyteller" },
  { name: "Thokozani Kamanga", handle: "@thoko", role: "Craft Brewer" },
];

/* ── Reactions List Popup Modal (With Reaction Icon Tab Switcher) ── */

function ReactionsListModal({
  visible,
  postId,
  postAuthor,
  onClose,
  colors,
}: {
  visible: boolean;
  postId: string;
  postAuthor: string;
  onClose: () => void;
  colors: ColorPalette;
}) {
  const { reactionsMap, getUserReaction } = useOlive();
  const reactions = reactionsMap[postId];
  const userReaction = getUserReaction(postId);
  const [selectedTab, setSelectedTab] = useState<"all" | ReactionType>("all");

  const slideAnim = useRef(new Animated.Value(340)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [animVisible, setAnimVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setAnimVisible(true);
      setSelectedTab("all");
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (animVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 340,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => setAnimVisible(false));
    }
  }, [visible]);

  if (!visible && !animVisible) return null;
  if (!reactions) return null;

  // Active reaction types with counts > 0
  const activeTabs = REACTION_DEFS.filter(
    (def) => (reactions[def.type] ?? 0) > 0
  );

  const totalCount = Object.values(reactions).reduce((a, b) => a + b, 0);

  // Generate deterministic reactor items matching the reaction counts
  const availableCandidates = COMMUNITY_REACTORS.filter(
    (c) => c.name !== postAuthor
  );

  // Seed based on postId
  const seed = Math.abs(
    postId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );

  type ReactorItem = {
    id: string;
    name: string;
    handle: string;
    role: string;
    reaction: ReactionType;
    isCurrentUser?: boolean;
  };

  const allReactors: ReactorItem[] = [];

  // 1. Add current user if they reacted
  if (userReaction) {
    allReactors.push({
      id: "current-user",
      name: "You",
      handle: "@you",
      role: "Your reaction",
      reaction: userReaction,
      isCurrentUser: true,
    });
  }

  // 2. Add community members for each reaction type
  let candidateOffset = seed;
  activeTabs.forEach((def) => {
    const rawCount = reactions[def.type] ?? 0;
    const countNeeded =
      userReaction === def.type ? Math.max(0, rawCount - 1) : rawCount;

    for (let i = 0; i < countNeeded; i++) {
      const candidate =
        availableCandidates[(candidateOffset + i) % availableCandidates.length];
      allReactors.push({
        id: `${candidate.name}-${def.type}-${i}`,
        name: candidate.name,
        handle: candidate.handle,
        role: candidate.role,
        reaction: def.type,
      });
      candidateOffset += 1;
    }
  });

  // Filter reactors according to selected tab
  const displayedReactors =
    selectedTab === "all"
      ? allReactors
      : allReactors.filter((r) => r.reaction === selectedTab);

  const rStyles = reactionsModalStyles(colors);

  return (
    <Modal
      transparent
      visible={visible || animVisible}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={rStyles.overlay}>
        {/* Backdrop dismiss */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.overlay, opacity: fadeAnim },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close reactions modal"
          />
        </Animated.View>

        {/* Sliding Sheet */}
        <Animated.View
          style={[rStyles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Drag Handle */}
          <View style={rStyles.handle} />

          {/* Header */}
          <View style={rStyles.header}>
            <Text style={rStyles.title}>Reactions</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close reactions modal"
              onPress={onClose}
              style={({ pressed }) => [
                rStyles.closeButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Tab Switcher */}
          <View style={rStyles.tabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={rStyles.tabsContent}
            >
              {/* "All" Tab */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`All ${totalCount} reactions`}
                onPress={() => setSelectedTab("all")}
                style={[
                  rStyles.tabPill,
                  selectedTab === "all" && rStyles.tabPillActive,
                ]}
              >
                <Text
                  style={[
                    rStyles.tabLabel,
                    selectedTab === "all" && rStyles.tabLabelActive,
                  ]}
                >
                  All
                </Text>
                <Text
                  style={[
                    rStyles.tabCount,
                    selectedTab === "all" && rStyles.tabCountActive,
                  ]}
                >
                  {totalCount}
                </Text>
              </Pressable>

              {/* Reaction Type Tabs */}
              {activeTabs.map((def) => {
                const count = reactions[def.type] ?? 0;
                const isSelected = selectedTab === def.type;
                const Icon = def.Icon;
                return (
                  <Pressable
                    key={def.type}
                    accessibilityRole="button"
                    accessibilityLabel={`${def.label} ${count} reactions`}
                    onPress={() => setSelectedTab(def.type)}
                    style={[
                      rStyles.tabPill,
                      isSelected && rStyles.tabPillActive,
                    ]}
                  >
                    <Icon size={15} color={def.activeColor} fill="none" />
                    <Text
                      style={[
                        rStyles.tabCount,
                        isSelected && rStyles.tabCountActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* People List */}
          <ScrollView
            style={rStyles.listScroll}
            contentContainerStyle={rStyles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {displayedReactors.map((item) => {
              const def = getReactionDef(item.reaction);
              const ReactionIcon = def.Icon;
              const initials = item.isCurrentUser
                ? "You"
                : item.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2);

              return (
                <View key={item.id} style={rStyles.personRow}>
                  {/* Avatar with miniature reaction icon badge */}
                  <View style={rStyles.avatarWrap}>
                    <View style={rStyles.avatar}>
                      <Text style={rStyles.avatarText}>{initials}</Text>
                    </View>
                    <View
                      style={[
                        rStyles.miniReactionBadge,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <ReactionIcon
                        size={11}
                        color={def.activeColor}
                        fill="none"
                      />
                    </View>
                  </View>

                  {/* Name and Handle */}
                  <View style={rStyles.personMeta}>
                    <Text numberOfLines={1} style={rStyles.personName}>
                      {item.name}
                    </Text>
                    <Text numberOfLines={1} style={rStyles.personSub}>
                      {item.handle} · {item.role}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const reactionsModalStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: colors.line,
      paddingTop: 10,
      paddingBottom: 28,
      maxHeight: "72%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 16,
      maxWidth: 600,
      width: "100%",
      alignSelf: "center",
    },
    handle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
      alignSelf: "center",
      marginBottom: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.2,
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    tabsWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      paddingBottom: 10,
    },
    tabsContent: {
      paddingHorizontal: 20,
      gap: 8,
      alignItems: "center",
    },
    tabPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 9999,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: "transparent",
    },
    tabPillActive: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    tabLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.muted,
    },
    tabLabelActive: {
      color: colors.text,
      fontWeight: "700",
    },
    tabCount: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
    },
    tabCountActive: {
      color: colors.text,
      fontWeight: "700",
    },
    listScroll: {
      flexGrow: 0,
      maxHeight: 360,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    personRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      gap: 12,
    },
    avatarWrap: {
      position: "relative",
      width: 40,
      height: 40,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.line,
    },
    avatarText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
    },
    miniReactionBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    personMeta: {
      flex: 1,
    },
    personName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    personSub: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
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
  onPress,
}: {
  post: Post;
  colors: ColorPalette;
  embedded?: boolean;
  onPress: () => void;
}) {
  const nStyles = noPhotoStyles(colors, embedded);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${post.place} details`}
      onPress={onPress}
      style={({ pressed }) => [nStyles.outer, pressed && { opacity: 0.92 }]}
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

/* ── Reshare Options Sheet (Instant Repost / Quote / Share) ──────── */

function ReshareOptionsSheet({
  visible,
  post,
  isRepostedByMe,
  existingQuoteNote,
  onInstantRepost,
  onSaveQuoteRepost,
  onRemoveRepost,
  onShareExternal,
  onClose,
  colors,
}: {
  visible: boolean;
  post: Post;
  isRepostedByMe: boolean;
  existingQuoteNote: string | null;
  onInstantRepost: () => void;
  onSaveQuoteRepost: (note: string) => void;
  onRemoveRepost: () => void;
  onShareExternal: () => void;
  onClose: () => void;
  colors: ColorPalette;
}) {
  const slideAnim = useRef(new Animated.Value(360)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [animVisible, setAnimVisible] = useState(false);
  const [mode, setMode] = useState<"menu" | "quote">("menu");
  const [quoteText, setQuoteText] = useState("");

  useEffect(() => {
    if (visible) {
      setMode("menu");
      setQuoteText(existingQuoteNote ?? "");
      setAnimVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (animVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 360,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => setAnimVisible(false));
    }
  }, [visible]);

  if (!visible && !animVisible) return null;

  const mStyles = menuStyles(colors);
  const rStyles = reshareSheetStyles(colors);

  const actions = [
    {
      id: "instant",
      icon: Repeat2,
      label:
        isRepostedByMe && !existingQuoteNote
          ? "Undo Instant Repost"
          : isRepostedByMe
          ? "Switch to Instant Repost"
          : "Instant Repost",
      subLabel:
        isRepostedByMe && !existingQuoteNote
          ? "Remove this post from your reposts"
          : "Share directly to your followers' feed",
      iconColor:
        isRepostedByMe && !existingQuoteNote ? colors.signal : colors.text,
      iconBg:
        isRepostedByMe && !existingQuoteNote
          ? colors.signalLight
          : colors.surfaceMuted,
      onPress: () => {
        if (isRepostedByMe && !existingQuoteNote) {
          onRemoveRepost();
        } else {
          onInstantRepost();
        }
        onClose();
      },
    },
    {
      id: "quote",
      icon: Quote,
      label: existingQuoteNote ? "Edit Quote Repost" : "Quote Repost",
      subLabel: existingQuoteNote
        ? "Update your commentary on this post"
        : "Add your own thoughts above the post",
      iconColor: existingQuoteNote ? colors.signal : colors.text,
      iconBg: existingQuoteNote ? colors.signalLight : colors.surfaceMuted,
      onPress: () => {
        setQuoteText(existingQuoteNote ?? "");
        setMode("quote");
      },
    },
    ...(isRepostedByMe && existingQuoteNote
      ? [
          {
            id: "remove",
            icon: Trash2,
            label: "Remove Repost",
            subLabel: "Remove this quote repost from your profile",
            iconColor: colors.error,
            iconBg: `${colors.error}15`,
            onPress: () => {
              onRemoveRepost();
              onClose();
            },
          },
        ]
      : []),
    {
      id: "share",
      icon: Share2,
      label: "Share Externally",
      subLabel: "Send via system share sheet or copy link",
      iconColor: colors.text,
      iconBg: colors.surfaceMuted,
      onPress: () => {
        onClose();
        setTimeout(onShareExternal, 200);
      },
    },
  ];

  const canPublish = quoteText.trim().length > 0;

  return (
    <Modal
      transparent
      visible={visible || animVisible}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={mStyles.overlay}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.overlay, opacity: fadeAnim },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close reshare sheet"
          />
        </Animated.View>

        <Animated.View
          style={[mStyles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={mStyles.handle} />

          {mode === "menu" ? (
            <>
              <View style={mStyles.header}>
                <View style={mStyles.thumbnailWrap}>
                  {post.image ? (
                    <Image source={post.image} style={mStyles.thumbnail} />
                  ) : (
                    <View style={mStyles.thumbnailFallback}>
                      <MapPin size={18} color={colors.signal} />
                    </View>
                  )}
                </View>
                <View style={mStyles.headerMeta}>
                  <Text numberOfLines={1} style={mStyles.headerTitle}>
                    Reshare Post
                  </Text>
                  <Text numberOfLines={1} style={mStyles.headerSubtitle}>
                    {post.author} · {post.place}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss reshare sheet"
                  onPress={onClose}
                  style={({ pressed }) => [
                    mStyles.closeButton,
                    pressed && mStyles.pressed,
                  ]}
                >
                  <X size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={mStyles.actionList}>
                {actions.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      onPress={item.onPress}
                      style={({ pressed }) => [
                        mStyles.actionRow,
                        pressed && mStyles.actionRowPressed,
                      ]}
                    >
                      <View
                        style={[
                          mStyles.iconContainer,
                          { backgroundColor: item.iconBg },
                        ]}
                      >
                        <IconComponent size={18} color={item.iconColor} />
                      </View>
                      <View style={mStyles.actionTextCol}>
                        <Text
                          style={[
                            mStyles.actionLabel,
                            item.id === "remove" && { color: colors.error },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text numberOfLines={1} style={mStyles.actionSubLabel}>
                          {item.subLabel}
                        </Text>
                      </View>
                      <ChevronRight size={16} color={colors.muted} />
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                onPress={onClose}
                style={({ pressed }) => [
                  mStyles.cancelButton,
                  pressed && mStyles.pressed,
                ]}
              >
                <Text style={mStyles.cancelText}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <View style={rStyles.composerWrap}>
              <View style={rStyles.composerHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to reshare options"
                  onPress={() => setMode("menu")}
                  style={({ pressed }) => [
                    mStyles.closeButton,
                    pressed && mStyles.pressed,
                  ]}
                >
                  <ArrowLeft size={16} color={colors.textSecondary} />
                </Pressable>
                <Text style={rStyles.composerTitle}>Quote Repost</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close quote composer"
                  onPress={onClose}
                  style={({ pressed }) => [
                    mStyles.closeButton,
                    pressed && mStyles.pressed,
                  ]}
                >
                  <X size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              <TextInput
                value={quoteText}
                onChangeText={setQuoteText}
                placeholder="Add your thoughts about this spot..."
                placeholderTextColor={colors.muted}
                multiline
                maxLength={280}
                autoFocus
                style={rStyles.quoteInput}
              />

              <View style={rStyles.quotePreview}>
                <Text numberOfLines={1} style={rStyles.quotePreviewAuthor}>
                  {post.author} · {post.place}
                </Text>
                <Text numberOfLines={2} style={rStyles.quotePreviewTitle}>
                  {post.title}
                </Text>
              </View>

              <View style={rStyles.composerFooter}>
                <Text style={rStyles.charCount}>{quoteText.length}/280</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Publish quote repost"
                  disabled={!canPublish}
                  onPress={() => {
                    if (!canPublish) return;
                    onSaveQuoteRepost(quoteText.trim());
                    onClose();
                  }}
                  style={({ pressed }) => [
                    rStyles.publishBtn,
                    !canPublish && rStyles.publishBtnDisabled,
                    pressed && canPublish && mStyles.pressed,
                  ]}
                >
                  <Text style={rStyles.publishBtnText}>
                    {existingQuoteNote ? "Update Quote" : "Post Quote"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const reshareSheetStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    composerWrap: {
      gap: 12,
      paddingTop: 2,
    },
    composerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 6,
    },
    composerTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    quoteInput: {
      minHeight: 96,
      maxHeight: 160,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surfaceMuted,
      padding: 14,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      textAlignVertical: "top",
    },
    quotePreview: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.bg,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 2,
    },
    quotePreviewAuthor: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.text,
    },
    quotePreviewTitle: {
      fontSize: 12.5,
      lineHeight: 17,
      color: colors.muted,
    },
    composerFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 2,
    },
    charCount: {
      fontSize: 12,
      color: colors.muted,
    },
    publishBtn: {
      paddingHorizontal: 18,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.signal,
      alignItems: "center",
      justifyContent: "center",
    },
    publishBtnDisabled: {
      opacity: 0.45,
    },
    publishBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.signalForeground,
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
    openExpandedWindow,
    reviewsMap,
    getUserReaction,
    setReaction,
    removeReaction,
    reactionsMap,
    isReposted,
    toggleRepost,
    getUserQuoteNote,
    setQuoteRepost,
    removeRepost,
  } = useOlive();

  const userReaction = getUserReaction(post.id);
  const userReposted = isReposted(post.id);
  const userQuoteNote = getUserQuoteNote(post.id);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reshareSheetVisible, setReshareSheetVisible] = useState(false);
  const [reactionsModalVisible, setReactionsModalVisible] = useState(false);
  const [anchorY, setAnchorY] = useState(300);
  const reactionButtonRef = useRef<View>(null);
  const longPressedRef = useRef(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

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

  const openPlace = () => {
    closeSearch();
    openExpandedWindow({ type: "details", post });
  };

  const openProfileByName = (name: string) => {
    closeSearch();
    router.push({
      pathname: "/profile",
      params: { author: name, id: post.id },
    });
  };

  const openAuthorProfile = () => openProfileByName(post.author);

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

  const handleMoreOptions = () => {
    setMenuVisible(true);
  };

  const handleInstantRepost = () => {
    if (!userReposted) {
      toggleRepost(post.id);
    } else if (userQuoteNote) {
      // Switch from quote repost back to instant repost
      removeRepost(post.id);
      toggleRepost(post.id);
    }
  };

  /* ── Determine which icon to show for the reaction button ────── */
  const currentReactionDef = userReaction
    ? getReactionDef(userReaction)
    : REACTION_DEFS[0];
  const ReactionIcon = currentReactionDef.Icon;

  const moreButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="More options"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={handleMoreOptions}
      style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
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
        accessibilityRole="button"
        accessibilityLabel={`Open ${post.place} details`}
        onPress={openPlace}
        style={[styles.imageWrap, embedded && styles.embeddedImageWrap]}
      >
        <Image source={post.image} style={styles.postImage} />
      </Pressable>
    ) : (
      <NoPhotoEditorialCard
        post={post}
        colors={colors}
        embedded={embedded}
        onPress={openPlace}
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
            accessibilityLabel="Reshare options"
            onPress={() => setReshareSheetVisible(true)}
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.pressed,
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
          accessibilityRole="button"
          accessibilityLabel="View community reactions"
          onPress={() => setReactionsModalVisible(true)}
          style={({ pressed }) => [
            styles.socialProofRow,
            pressed && { opacity: 0.7 },
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

      {/* Post Options Menu Modal Sheet */}
      <PostOptionsMenu
        visible={menuVisible}
        post={post}
        saved={saved}
        onToggleSave={() => toggleSave(post.id)}
        onShare={handleShare}
        onViewPlace={openPlace}
        onViewAuthor={openAuthorProfile}
        onClose={() => setMenuVisible(false)}
        colors={colors}
      />

      {/* Reshare Options Sheet (Instant Repost / Quote Repost / Share) */}
      <ReshareOptionsSheet
        visible={reshareSheetVisible}
        post={post}
        isRepostedByMe={userReposted}
        existingQuoteNote={userQuoteNote}
        onInstantRepost={handleInstantRepost}
        onSaveQuoteRepost={(note) => setQuoteRepost(post.id, note)}
        onRemoveRepost={() => removeRepost(post.id)}
        onShareExternal={handleShare}
        onClose={() => setReshareSheetVisible(false)}
        colors={colors}
      />

      {/* Reactions List Modal Sheet */}
      <ReactionsListModal
        visible={reactionsModalVisible}
        postId={post.id}
        postAuthor={post.author}
        onClose={() => setReactionsModalVisible(false)}
        colors={colors}
      />
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

import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Flag,
  Flame,
  Flower2,
  Hand,
  Heart,
  Laugh,
  MapPin,
  Quote,
  Repeat2,
  Share2,
  ThumbsUp,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import type { Post, ReactionType } from "../../models";
import { STORIES, type StoryItem } from "../../stories";
import { useOlive } from "../../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../../theme";

/* ── Shared Reaction Definitions & Community Directory ─────────────── */

export const REACTION_DEFS: {
  type: ReactionType;
  Icon: typeof Heart;
  label: string;
  activeColor: string;
}[] = [
  { type: "heart", Icon: Heart, label: "Love", activeColor: "#C83D4A" },
  { type: "flower", Icon: Flower2, label: "Flowers", activeColor: "#CE5A84" },
  { type: "fire", Icon: Flame, label: "Fire", activeColor: "#E04F22" },
  { type: "laugh", Icon: Laugh, label: "Haha", activeColor: "#D9822B" },
  { type: "clap", Icon: Hand, label: "Clap", activeColor: "#4F7E5E" },
  { type: "like", Icon: ThumbsUp, label: "Like", activeColor: "#3B7097" },
];

export function getReactionDef(type: ReactionType) {
  return REACTION_DEFS.find((r) => r.type === type) ?? REACTION_DEFS[0];
}

export const COMMUNITY_REACTORS = [
  { name: "Kondwani Banda", handle: "@kondwani", role: "Coffee & Architecture" },
  { name: "Dalitso Phiri", handle: "@dalitso", role: "Local Food Explorer" },
  { name: "Puma Energy", handle: "@pumaenergy", role: "Kenyatta Drive Bay" },
  { name: "Chisomo Banda", handle: "@chisomo", role: "Music & Live Sessions" },
  { name: "Tamanda Gondwe", handle: "@tamanda", role: "Market Gardener" },
  { name: "Lingadzi Sessions", handle: "@lingadzi", role: "Acoustic Arts Community" },
  { name: "Mabu Artisan Bakes", handle: "@mabubakes", role: "Artisan Baker" },
  { name: "Alinafe Mwale", handle: "@alinafe", role: "Wildlife & Nature Guide" },
  { name: "Tawonga Phiri", handle: "@tawonga", role: "Weekend Cyclist" },
  { name: "Chifundo Banda", handle: "@chifundo", role: "Urban Planner" },
  { name: "Lumbani Chirwa", handle: "@lumbani", role: "Area 10 Resident" },
  { name: "Madalitso Nyirenda", handle: "@madalitso", role: "Culture & Heritage" },
  { name: "Sekani Mhone", handle: "@sekani", role: "Specialty Roaster" },
  { name: "Chimwemwe Tembo", handle: "@chimwemwe", role: "Visual Storyteller" },
  { name: "Thokozani Kamanga", handle: "@thoko", role: "Craft Brewer" },
];

/* ── Post Options Content ──────────────────────────────────────────── */

export function PostOptionsContent({
  post,
  saved,
  onToggleSave,
  onShare,
  onViewPlace,
  onViewAuthor,
  onReport,
  onClose,
}: {
  post: Post;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onViewPlace: () => void;
  onViewAuthor: () => void;
  onReport: () => void;
  onClose: () => void;
}) {
  const { styles, colors } = useThemeStyles(createStyles);

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
        setTimeout(onShare, 180);
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
      onPress: onViewPlace,
    },
    {
      id: "author",
      icon: User,
      label: `About ${post.author}`,
      subLabel: "View curator profile, guides & stories",
      iconColor: colors.text,
      iconBg: colors.surfaceMuted,
      fillIcon: false,
      onPress: onViewAuthor,
    },
    {
      id: "report",
      icon: Flag,
      label: "Report Post",
      subLabel: "Flag inappropriate content or inaccuracies",
      iconColor: colors.error,
      iconBg: `${colors.error}15`,
      fillIcon: false,
      onPress: onReport,
    },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Compact Post Preview */}
      <View style={styles.previewRow}>
        <View style={styles.thumbnailWrap}>
          {post.image ? (
            <Image source={post.image} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailFallback}>
              <MapPin size={18} color={colors.signal} />
            </View>
          )}
        </View>
        <View style={styles.previewMeta}>
          <Text numberOfLines={1} style={styles.previewTitle}>
            {post.place}
          </Text>
          <Text numberOfLines={1} style={styles.previewSubtitle}>
            {post.author} · {post.category} · {post.kind}
          </Text>
        </View>
      </View>

      {/* Action List */}
      <View style={styles.actionList}>
        {menuActions.map((item) => {
          const IconComponent = item.icon;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.actionRowPressed,
              ]}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.iconBg }]}
              >
                <IconComponent
                  size={18}
                  color={item.iconColor}
                  fill={item.fillIcon ? item.iconColor : "none"}
                />
              </View>
              <View style={styles.actionTextCol}>
                <Text
                  style={[
                    styles.actionLabel,
                    item.id === "report" && { color: colors.error },
                  ]}
                >
                  {item.label}
                </Text>
                <Text numberOfLines={1} style={styles.actionSubLabel}>
                  {item.subLabel}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.muted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* ── Reshare Options & Quote Composer Content ──────────────────────── */

export function ReshareContent({
  post,
  isRepostedByMe,
  existingQuoteNote,
  onInstantRepost,
  onSaveQuoteRepost,
  onRemoveRepost,
  onShareExternal,
  onClose,
}: {
  post: Post;
  isRepostedByMe: boolean;
  existingQuoteNote: string | null;
  onInstantRepost: () => void;
  onSaveQuoteRepost: (note: string) => void;
  onRemoveRepost: () => void;
  onShareExternal: () => void;
  onClose: () => void;
}) {
  const { styles, colors } = useThemeStyles(createStyles);
  const [mode, setMode] = useState<"menu" | "quote">("menu");
  const [quoteText, setQuoteText] = useState(existingQuoteNote ?? "");

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
        setTimeout(onShareExternal, 180);
      },
    },
  ];

  const canPublish = quoteText.trim().length > 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {mode === "menu" ? (
        <>
          <View style={styles.previewRow}>
            <View style={styles.thumbnailWrap}>
              {post.image ? (
                <Image source={post.image} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnailFallback}>
                  <MapPin size={18} color={colors.signal} />
                </View>
              )}
            </View>
            <View style={styles.previewMeta}>
              <Text numberOfLines={1} style={styles.previewTitle}>
                {post.author}
              </Text>
              <Text numberOfLines={1} style={styles.previewSubtitle}>
                {post.place} · {post.title}
              </Text>
            </View>
          </View>

          <View style={styles.actionList}>
            {actions.map((item) => {
              const IconComponent = item.icon;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.actionRow,
                    pressed && styles.actionRowPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.iconBg },
                    ]}
                  >
                    <IconComponent size={18} color={item.iconColor} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text
                      style={[
                        styles.actionLabel,
                        item.id === "remove" && { color: colors.error },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text numberOfLines={1} style={styles.actionSubLabel}>
                      {item.subLabel}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.muted} />
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.composerWrap}>
          <View style={styles.composerHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to reshare options"
              onPress={() => setMode("menu")}
              style={({ pressed }) => [
                styles.subBackBtn,
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft size={16} color={colors.textSecondary} />
              <Text style={styles.subBackText}>Options</Text>
            </Pressable>
            <Text style={styles.composerTitle}>Quote Repost</Text>
          </View>

          <TextInput
            value={quoteText}
            onChangeText={setQuoteText}
            placeholder="Add your thoughts about this spot..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={280}
            autoFocus
            style={styles.quoteInput}
          />

          <View style={styles.quotePreview}>
            <Text numberOfLines={1} style={styles.quotePreviewAuthor}>
              {post.author} · {post.place}
            </Text>
            <Text numberOfLines={2} style={styles.quotePreviewTitle}>
              {post.title}
            </Text>
          </View>

          <View style={styles.composerFooter}>
            <Text style={styles.charCount}>{quoteText.length}/280</Text>
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
                styles.publishBtn,
                !canPublish && styles.publishBtnDisabled,
                pressed && canPublish && styles.pressed,
              ]}
            >
              <Text style={styles.publishBtnText}>
                {existingQuoteNote ? "Update Quote" : "Post Quote"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/* ── Reactions List Content ────────────────────────────────────────── */

export function ReactionsListContent({
  postId,
  postAuthor,
}: {
  postId: string;
  postAuthor: string;
}) {
  const { styles, colors } = useThemeStyles(createStyles);
  const { reactionsMap, getUserReaction } = useOlive();
  const reactions = reactionsMap[postId];
  const userReaction = getUserReaction(postId);
  const [selectedTab, setSelectedTab] = useState<"all" | ReactionType>("all");

  if (!reactions) return null;

  const activeTabs = REACTION_DEFS.filter(
    (def) => (reactions[def.type] ?? 0) > 0
  );
  const totalCount = Object.values(reactions).reduce((a, b) => a + b, 0);

  const availableCandidates = COMMUNITY_REACTORS.filter(
    (c) => c.name !== postAuthor
  );

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

  const displayedReactors =
    selectedTab === "all"
      ? allReactors
      : allReactors.filter((r) => r.reaction === selectedTab);

  return (
    <View style={styles.reactionsRoot}>
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`All ${totalCount} reactions`}
            onPress={() => setSelectedTab("all")}
            style={[
              styles.tabPill,
              selectedTab === "all" && styles.tabPillActive,
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                selectedTab === "all" && styles.tabLabelActive,
              ]}
            >
              All
            </Text>
            <Text
              style={[
                styles.tabCount,
                selectedTab === "all" && styles.tabCountActive,
              ]}
            >
              {totalCount}
            </Text>
          </Pressable>

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
                style={[styles.tabPill, isSelected && styles.tabPillActive]}
              >
                <Icon size={15} color={def.activeColor} fill="none" />
                <Text
                  style={[
                    styles.tabCount,
                    isSelected && styles.tabCountActive,
                  ]}
                >
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.reactorsListContent}
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
            <View key={item.id} style={styles.personRow}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View
                  style={[
                    styles.miniReactionBadge,
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

              <View style={styles.personMeta}>
                <Text numberOfLines={1} style={styles.personName}>
                  {item.name}
                </Text>
                <Text numberOfLines={1} style={styles.personSub}>
                  {item.handle} · {item.role}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ── Story Viewer Content (inside Morphing Story Window) ───────────── */

export function StoryPopupContent({
  activeIndex,
  onIndexChange,
  onClose,
  onNavigateToPlace,
}: {
  activeIndex: number;
  onIndexChange: (nextIndex: number) => void;
  onClose: () => void;
  onNavigateToPlace: (story: StoryItem) => void;
}) {
  const { styles, colors } = useThemeStyles(createStyles);
  const [reactedEmoji, setReactedEmoji] = useState<string | null>(null);
  const activeStory = STORIES[activeIndex] ?? STORIES[0];

  const handleNext = () => {
    if (activeIndex < STORIES.length - 1) {
      onIndexChange(activeIndex + 1);
      setReactedEmoji(null);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      onIndexChange(activeIndex - 1);
      setReactedEmoji(null);
    }
  };

  const handleReaction = (emoji: string) => {
    setReactedEmoji(emoji);
    setTimeout(() => {
      setReactedEmoji(null);
    }, 1800);
  };

  return (
    <View style={styles.storyInner}>
      {/* Top Progress Segments */}
      <View style={styles.progressRow}>
        {STORIES.map((s, idx) => (
          <View key={s.id} style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                idx <= activeIndex
                  ? styles.progressBarActive
                  : styles.progressBarInactive,
              ]}
            />
          </View>
        ))}
      </View>

      {/* Story Header */}
      <View style={styles.storyHeader}>
        <Pressable
          onPress={() => onNavigateToPlace(activeStory)}
          style={styles.storyAuthorRow}
        >
          <View style={styles.headerAvatarWrap}>
            <Image
              source={activeStory.avatar}
              style={styles.headerAvatar}
            />
          </View>
          <View style={styles.headerMeta}>
            <View style={styles.authorTitleRow}>
              <Text style={styles.headerAuthorName} numberOfLines={1}>
                {activeStory.authorName}
              </Text>
              {activeStory.badge && (
                <View
                  style={[
                    styles.headerBadgePill,
                    activeStory.badge === "LIVE"
                      ? styles.statusBadgeLive
                      : activeStory.badge === "NEW"
                      ? styles.statusBadgeNew
                      : styles.statusBadgeHot,
                  ]}
                >
                  <Text style={styles.headerBadgeText}>
                    {activeStory.badge}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close story"
          onPress={onClose}
          style={({ pressed }) => [styles.storyCloseBtn, pressed && styles.pressed]}
        >
          <X size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* Story Content Card with navigation tap areas */}
      <View style={styles.storyMediaCard}>
        <Image
          source={activeStory.storyImage}
          style={styles.storyImage}
          resizeMode="cover"
        />

        <Pressable style={styles.tapPrevZone} onPress={handlePrev} />
        <Pressable style={styles.tapNextZone} onPress={handleNext} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.storyOverlayGradient}
        >
          <View style={styles.storyCaptionBox}>
            <Text style={styles.storyTitleText}>{activeStory.title}</Text>
            <Text style={styles.storyCaptionText}>{activeStory.caption}</Text>
          </View>
        </LinearGradient>
      </View>

      {reactedEmoji && (
        <View style={styles.reactionToast}>
          <Text style={styles.reactionToastText}>
            Sent {reactedEmoji} to {activeStory.displayName}
          </Text>
        </View>
      )}

      {/* Bottom Quick-Action & Reaction Row */}
      <View style={styles.storyBottomBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigateToPlace(activeStory)}
          style={({ pressed }) => [
            styles.viewVenueBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.viewVenueText}>
            {activeStory.isOwner ? "View My Profile" : "View Venue"}
          </Text>
          <ChevronRight size={14} color="#FFFFFF" />
        </Pressable>

        <View style={styles.reactionsGroup}>
          {["❤️", "🔥", "👏", "😋"].map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => handleReaction(emoji)}
              style={({ pressed }) => [
                styles.reactionBtn,
                pressed && styles.reactionBtnPressed,
              ]}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 12,
    },
    previewRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surfaceMuted,
    },
    thumbnailWrap: {
      width: 42,
      height: 42,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: colors.surface,
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
    },
    previewMeta: {
      flex: 1,
    },
    previewTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    previewSubtitle: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    actionList: {
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
    composerWrap: {
      gap: 12,
    },
    composerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    subBackBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: colors.surfaceMuted,
    },
    subBackText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    composerTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    quoteInput: {
      minHeight: 96,
      maxHeight: 150,
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
    pressed: {
      opacity: 0.7,
    },

    /* Reactions List */
    reactionsRoot: {
      flex: 1,
    },
    tabsWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      paddingTop: 10,
      paddingBottom: 10,
    },
    tabsContent: {
      paddingHorizontal: 16,
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
    reactorsListContent: {
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    personRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 9,
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

    /* Story Popup */
    storyInner: {
      flex: 1,
    },
    progressRow: {
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    progressBarTrack: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 2,
    },
    progressBarActive: {
      backgroundColor: colors.signal,
      width: "100%",
    },
    progressBarInactive: {
      backgroundColor: "transparent",
      width: "0%",
    },
    storyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    storyAuthorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    headerAvatarWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.signal,
    },
    headerAvatar: {
      width: "100%",
      height: "100%",
      borderRadius: 20,
      resizeMode: "cover",
    },
    headerMeta: {
      flex: 1,
    },
    authorTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerAuthorName: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    headerBadgePill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    statusBadgeLive: {
      backgroundColor: "#DC2626",
    },
    statusBadgeHot: {
      backgroundColor: colors.signal,
    },
    statusBadgeNew: {
      backgroundColor: "#10B981",
    },
    headerBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    storyCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
      borderColor: colors.line,
    },
    storyMediaCard: {
      flex: 1,
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 24,
      overflow: "hidden",
      position: "relative",
      backgroundColor: "#111827",
    },
    storyImage: {
      width: "100%",
      height: "100%",
    },
    tapPrevZone: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "35%",
      zIndex: 5,
    },
    tapNextZone: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "65%",
      zIndex: 5,
    },
    storyOverlayGradient: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 48,
      paddingBottom: 20,
      zIndex: 10,
      pointerEvents: "none",
    },
    storyCaptionBox: {
      gap: 8,
    },
    storyTitleText: {
      fontSize: 18,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.2,
    },
    storyCaptionText: {
      fontSize: 14,
      lineHeight: 20,
      color: "rgba(255, 255, 255, 0.9)",
    },
    reactionToast: {
      position: "absolute",
      top: 60,
      alignSelf: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      zIndex: 20,
      elevation: 8,
      backgroundColor: colors.signal,
    },
    reactionToastText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },
    storyBottomBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      gap: 12,
    },
    viewVenueBtn: {
      flex: 1,
      height: 44,
      borderRadius: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.signal,
    },
    viewVenueText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    reactionsGroup: {
      flexDirection: "row",
      gap: 8,
    },
    reactionBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
      borderColor: colors.line,
    },
    reactionBtnPressed: {
      transform: [{ scale: 1.25 }],
    },
    reactionEmoji: {
      fontSize: 18,
    },
  });

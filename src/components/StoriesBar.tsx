import { useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import { useThemeStyles, type ColorPalette } from "../theme";
import { STORIES } from "../stories";
import { useOlive } from "../context/OliveProvider";
import { measureNodeInRoot } from "./popup/MorphTrigger";

export function StoriesBar() {
  const { styles, colors } = useThemeStyles(createStyles);
  const { activePopup, openPopup, rootContainerRef } = useOlive();
  const storyRefs = useRef<Record<string, View | null>>({});

  const activeStoryIndex =
    activePopup?.payload.type === "story"
      ? activePopup.payload.activeIndex ?? activePopup.payload.initialIndex
      : null;

  const handleOpenStory = (index: number) => {
    if (activePopup !== null) return;
    const story = STORIES[index];
    if (!story) return;

    const node = storyRefs.current[story.id] ?? null;
    measureNodeInRoot(node, rootContainerRef.current).then((rect) => {
      openPopup(
        { type: "story", initialIndex: index, activeIndex: index },
        {
          triggerId: `story-${story.id}`,
          rect,
          style: {
            borderRadius: 32,
            backgroundColor: colors.surface,
            borderColor: story.hasUnread ? colors.signal : colors.line,
            borderWidth: 2,
          },
          resolveCloseRect: async (payload) => {
            const idx =
              payload.type === "story"
                ? payload.activeIndex ?? payload.initialIndex
                : index;
            const targetStory = STORIES[idx];
            if (!targetStory) return null;
            const closeNode = storyRefs.current[targetStory.id] ?? null;
            if (!closeNode) return null;
            return measureNodeInRoot(closeNode, rootContainerRef.current);
          },
        }
      );
    });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {STORIES.map((story, index) => {
        const isOwner = story.isOwner;
        const hasUnread = story.hasUnread;
        const isMorphedOut = activeStoryIndex === index;

        return (
          <Pressable
            key={story.id}
            accessibilityRole="button"
            accessibilityLabel={`${story.displayName}'s story`}
            onPress={() => handleOpenStory(index)}
            style={({ pressed }) => [
              styles.storyItem,
              pressed && styles.pressed,
            ]}
          >
            {/* Ring container */}
            <View
              ref={(el) => {
                storyRefs.current[story.id] = el;
              }}
              collapsable={false}
              style={[styles.avatarWrapper, isMorphedOut && styles.morphedOut]}
            >
              {isOwner ? (
                <View style={styles.ownerRing}>
                  <View style={styles.innerRingSpacer}>
                    <Image source={story.avatar} style={styles.avatarImg} />
                  </View>
                  <View style={styles.addBadge}>
                    <Plus size={16} color="#FFFFFF" />
                  </View>
                </View>
              ) : hasUnread ? (
                <LinearGradient
                  colors={[colors.signal, "#F59E0B", "#EF4444"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientRing}
                >
                  <View style={styles.innerRingSpacer}>
                    <Image source={story.avatar} style={styles.avatarImg} />
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.seenRing}>
                  <View style={styles.innerRingSpacer}>
                    <Image source={story.avatar} style={styles.avatarImg} />
                  </View>
                </View>
              )}
            </View>

            {/* Display name */}
            <Text
              numberOfLines={1}
              style={[
                styles.storyLabel,
                hasUnread ? styles.storyLabelUnread : styles.storyLabelDefault,
              ]}
            >
              {story.displayName}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    storyItem: {
      alignItems: "center",
      width: "auto",
    },
    pressed: {
      opacity: 0.85,
    },
    morphedOut: {
      opacity: 0,
    },
    avatarWrapper: {
      width: "auto",
      height: "auto",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    ownerRing: {
      width: "auto",
      height: "auto",
      borderRadius: 40,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    gradientRing: {
      width: "auto",
      height: "auto",
      borderRadius: 40,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    innerRingSpacer: {
      width: 60,
      height: 80,
      borderRadius: 32,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
    },
    seenRing: {
      width: "auto",
      height: "auto",
      borderRadius: 40,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    avatarImg: {
      width: "100%",
      height: "100%",
      borderRadius: 32,
      resizeMode: "cover",
    },
    addBadge: {
      position: "absolute",
      bottom: -8,
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.signal,
      borderColor: colors.surface,
    },
    storyLabel: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 6,
      width: 72,
      color: colors.text,
    },
    storyLabelDefault: {
      fontWeight: "500",
    },
    storyLabelUnread: {
      fontWeight: "700",
    },
  });

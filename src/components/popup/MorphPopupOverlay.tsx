import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  type KeyboardEvent,
  PanResponder,
  type PanResponderGestureState,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bookmark,
  MessageCircle,
  Repeat2,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import { useOlive } from "../../context/OliveProvider";
import { getPostById, POSTS, REVIEWS } from "../../places";
import { STORIES } from "../../stories";
import { useThemeStyles, type ColorPalette } from "../../theme";
import { CommentsView } from "../dock/views/CommentsView";
import { DetailsView } from "../dock/views/DetailsView";
import { EditProfileView } from "../dock/views/EditProfileView";
import { MessageView } from "../dock/views/MessageView";
import { ReportView } from "../dock/views/ReportView";
import { SavedView } from "../dock/views/SavedView";
import { SettingsView } from "../dock/views/SettingsView";
import { VisitorsView } from "../dock/views/VisitorsView";
import {
  PostOptionsContent,
  ReactionsListContent,
  ReshareContent,
  StoryPopupContent,
} from "./PostPopupViews";
import type { ActivePopupState, PopupPayload, SourceRect } from "./popupTypes";

const HEADER_HEIGHT = 64;

function getIdealPopupHeight(payload: PopupPayload): number {
  switch (payload.type) {
    case "details":
      return 560;
    case "comments":
      return 500;
    case "profile_settings":
      return 500;
    case "edit_profile":
      return 480;
    case "reactions_list":
      return 460;
    case "profile_saved":
      return 460;
    case "profile_visitors":
      return 440;
    case "post_options":
      return 430;
    case "reshare":
      return 430;
    case "report":
      return 380;
    case "message":
      return 360;
    default:
      return 460;
  }
}

function getFallbackHeaderMeta(
  payload: PopupPayload,
  colors: ColorPalette
): {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
} {
  switch (payload.type) {
    case "comments":
      return {
        title: "Reviews & Comments",
        subtitle: `${payload.post.author} · ${payload.post.place}`,
        icon: <MessageCircle size={18} color={colors.text} />,
      };
    case "details":
      return {
        title: "Details",
        subtitle: `${payload.post.author} · ${payload.post.category} · ${payload.post.distanceKm} km`,
      };
    case "post_options":
      return {
        title: "Post Options",
        subtitle: `${payload.post.author} · ${payload.post.place}`,
      };
    case "reshare":
      return {
        title: "Reshare Post",
        subtitle: `${payload.post.author} · ${payload.post.place}`,
        icon: <Repeat2 size={18} color={colors.signal} />,
      };
    case "reactions_list":
      return {
        title: "Reactions",
        subtitle: payload.postAuthor,
      };
    case "edit_profile":
      return {
        title: "Edit Info",
        subtitle: "Name, neighborhood & bio",
      };
    case "profile_visitors":
      return {
        title: "Visitors",
        subtitle: "Recent profile activity",
      };
    case "message":
      return {
        title: "Message",
        subtitle: payload.recipient.name,
      };
    case "profile_saved":
      return {
        title: "Saved Places",
        subtitle: "Your bookmarked spots",
        icon: <Bookmark size={18} color={colors.signal} />,
      };
    case "profile_settings":
      return {
        title: "Preferences & Filters",
        subtitle: "Radius, categories & appearance",
        icon: <SlidersHorizontal size={18} color={colors.signal} />,
      };
    case "report":
      return {
        title: "Report Account",
        subtitle: payload.targetUser.handle,
      };
    default:
      return { title: "" };
  }
}

export function MorphPopupOverlay({
  appBlurTargetRef,
}: {
  appBlurTargetRef: RefObject<View | null>;
}) {
  const { activePopup, closePopup, clearPopup } = useOlive();

  if (!activePopup) return null;

  return (
    <MorphPopupSession
      key={activePopup.id}
      popup={activePopup}
      appBlurTargetRef={appBlurTargetRef}
      onRequestClose={closePopup}
      onFinishClose={clearPopup}
    />
  );
}

function MorphPopupSession({
  popup,
  appBlurTargetRef,
  onRequestClose,
  onFinishClose,
}: {
  popup: ActivePopupState;
  appBlurTargetRef: RefObject<View | null>;
  onRequestClose: () => void;
  onFinishClose: () => void;
}) {
  const { styles, colors, isDark } = useThemeStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {
    savedIds,
    isSaved,
    toggleSave,
    reviewsMap,
    isReposted,
    toggleRepost,
    getUserQuoteNote,
    setQuoteRepost,
    removeRepost,
    updateProfileOverrides,
    startGuidance,
    pushPopupPayload,
    popPopupPayload,
    updatePopupPayload,
    showToast,
  } = useOlive();

  const [windowDims, setWindowDims] = useState(() => Dimensions.get("window"));
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [closeRect, setCloseRect] = useState<SourceRect>(popup.origin.rect);

  const progress = useRef(new Animated.Value(0)).current;
  const hasStartedCloseRef = useRef(false);

  const { payload, origin, history, closing } = popup;
  const isImageViewer = payload.type === "image_viewer";
  const isStoryViewer = payload.type === "story";
  const isStandardCard = !isImageViewer && !isStoryViewer;

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setWindowDims(window);
    });
    return () => sub.remove();
  }, []);

  // Keyboard tracking so input popups remain unobstructed
  useEffect(() => {
    const handleShow = (e: KeyboardEvent) => {
      const kh = e.endCoordinates.height;
      if (kh > 0) setKeyboardHeight(kh);
    };
    const handleHide = () => setKeyboardHeight(0);

    const showEvents: ("keyboardWillShow" | "keyboardDidShow")[] =
      Platform.OS === "ios"
        ? ["keyboardWillShow"]
        : ["keyboardWillShow", "keyboardDidShow"];
    const hideEvents: ("keyboardWillHide" | "keyboardDidHide")[] =
      Platform.OS === "ios"
        ? ["keyboardWillHide"]
        : ["keyboardWillHide", "keyboardDidHide"];

    const subs = [
      ...showEvents.map((ev) => Keyboard.addListener(ev, handleShow)),
      ...hideEvents.map((ev) => Keyboard.addListener(ev, handleHide)),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  // Android hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (history.length > 0) {
        popPopupPayload();
      } else {
        onRequestClose();
      }
      return true;
    });
    return () => sub.remove();
  }, [history.length, popPopupPayload, onRequestClose]);

  // Open spring animation on mount
  useEffect(() => {
    Animated.spring(progress, {
      toValue: 1,
      friction: 9,
      tension: 66,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Close spring animation when `closing` becomes true
  useEffect(() => {
    if (!closing || hasStartedCloseRef.current) return;
    hasStartedCloseRef.current = true;
    Keyboard.dismiss();

    const runClose = () => {
      Animated.spring(progress, {
        toValue: 0,
        friction: 10,
        tension: 76,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          onFinishClose();
        } else {
          // Fallback cleanup in case animation was interrupted
          onFinishClose();
        }
      });
    };

    if (origin.resolveCloseRect) {
      let settled = false;
      const fallbackTimer = setTimeout(() => {
        if (!settled) {
          settled = true;
          runClose();
        }
      }, 60);

      origin
        .resolveCloseRect(payload)
        .then((nextRect) => {
          if (settled) return;
          settled = true;
          clearTimeout(fallbackTimer);
          if (nextRect && nextRect.width > 0 && nextRect.height > 0) {
            setCloseRect(nextRect);
          }
          requestAnimationFrame(runClose);
        })
        .catch(() => {
          if (!settled) {
            settled = true;
            clearTimeout(fallbackTimer);
            runClose();
          }
        });
    } else {
      runClose();
    }
  }, [closing, origin, payload, progress, onFinishClose]);

  const activeSourceRect = closing ? closeRect : origin.rect;
  const screenW = windowDims.width;
  const screenH = windowDims.height;

  // Compute target geometry based on pop-up type
  const target = useMemo(() => {
    if (payload.type === "image_viewer") {
      const natW = Math.max(1, payload.naturalWidth);
      const natH = Math.max(1, payload.naturalHeight);
      let targetW = natW;
      let targetH = natH;
      if (natW > screenW || natH > screenH) {
        const fitScale = Math.min(screenW / natW, screenH / natH);
        targetW = Math.round(natW * fitScale);
        targetH = Math.round(natH * fitScale);
      }
      const left = Math.round((screenW - targetW) / 2);
      const top = Math.round((screenH - targetH) / 2);
      const coversFullScreen =
        targetW >= screenW - 2 && targetH >= screenH - 2;
      return {
        left,
        top,
        width: targetW,
        height: targetH,
        borderRadius: coversFullScreen ? 0 : 18,
        backgroundColor: "#000000",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: coversFullScreen ? 0 : 1,
      };
    }

    if (payload.type === "story") {
      const targetW = Math.min(screenW - 16, 560);
      const left = Math.round((screenW - targetW) / 2);
      const top = Math.max(8, insets.top + 8);
      const bottom = Math.max(8, insets.bottom + 8);
      const height = Math.max(320, screenH - top - bottom);
      return {
        left,
        top,
        width: targetW,
        height,
        borderRadius: 32,
        backgroundColor: colors.surface,
        borderColor: colors.signal,
        borderWidth: 2,
      };
    }

    const targetW = Math.min(screenW - 24, 460);
    const left = Math.round((screenW - targetW) / 2);
    const safeBottom = Math.max(insets.bottom, 16);
    const bottomInset = Math.max(safeBottom, keyboardHeight + 12);
    const availH = Math.max(240, screenH - insets.top - bottomInset - 20);
    const idealH = getIdealPopupHeight(payload);
    const height = Math.min(idealH, availH);
    const top = Math.round(insets.top + 12 + Math.max(0, (availH - height) / 2));

    return {
      left,
      top,
      width: targetW,
      height,
      borderRadius: 28,
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderWidth: 1,
    };
  }, [payload, screenW, screenH, insets.top, insets.bottom, keyboardHeight, colors]);

  // Drag-down-to-dismiss on the header handle for standard cards
  const dragCollapseDeltaRef = useRef(260);
  dragCollapseDeltaRef.current = Math.max(160, target.height - activeSourceRect.height);

  const panResponder = useRef(
    (() => {
      const endGesture = (g: PanResponderGestureState) => {
        if (g.dy > 65 || g.vy > 0.45) {
          onRequestClose();
        } else {
          Animated.spring(progress, {
            toValue: 1,
            friction: 9,
            tension: 70,
            useNativeDriver: false,
          }).start();
        }
      };

      return PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          const dy = Math.max(0, g.dy);
          const next = Math.max(0, Math.min(1, 1 - dy / dragCollapseDeltaRef.current));
          progress.setValue(next);
        },
        onPanResponderRelease: (_, g) => endGesture(g),
        onPanResponderTerminate: (_, g) => endGesture(g),
      });
    })()
  ).current;

  // Interpolated shell bounds
  const animLeft = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [activeSourceRect.x, target.left],
  });
  const animTop = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [activeSourceRect.y, target.top],
  });
  const animWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [activeSourceRect.width, target.width],
  });
  const animHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [activeSourceRect.height, target.height],
  });
  const animRadius = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [origin.style.borderRadius, target.borderRadius],
  });
  const animBg = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [origin.style.backgroundColor, target.backgroundColor],
  });
  const animBorderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [origin.style.borderColor, target.borderColor],
  });
  const animBorderWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [origin.style.borderWidth, target.borderWidth],
  });

  // Backdrop & content interpolations
  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const ghostOpacity = progress.interpolate({
    inputRange: [0, 0.24],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const contentOpacity = progress.interpolate({
    inputRange: [0.22, 0.76],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const contentTranslateY = progress.interpolate({
    inputRange: [0.15, 1],
    outputRange: [16, 0],
    extrapolate: "clamp",
  });

  const headerExtraOpacity = progress.interpolate({
    inputRange: [0.32, 0.85],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTitleSlideX = progress.interpolate({
    inputRange: [0.25, 0.9],
    outputRange: [-8, 0],
    extrapolate: "clamp",
  });

  const savedPosts = useMemo(
    () => POSTS.filter((p) => savedIds.includes(p.id)),
    [savedIds]
  );

  // Morphing header element calculations (only used when history.length === 0)
  const headerMorph = history.length === 0 ? origin.headerMorph : undefined;
  const fallbackHeader = getFallbackHeaderMeta(payload, colors);
  const hasSharedIcon = Boolean(headerMorph?.icon);
  const hasSharedTitle = Boolean(headerMorph?.title);
  const targetTitleLeft = hasSharedIcon || history.length > 0 ? 58 : 16;

  const iconBadgeSize = 34;
  const iconTargetSize = 18;
  const iconStart = headerMorph?.icon;
  const iconAnimLeft = iconStart
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [iconStart.x, 16 + (iconBadgeSize - iconTargetSize) / 2],
      })
    : undefined;
  const iconAnimTop = iconStart
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [iconStart.y, 18 + (iconBadgeSize - iconTargetSize) / 2],
      })
    : undefined;
  const iconAnimScale = iconStart
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, iconTargetSize / iconStart.size],
      })
    : undefined;

  const titleStart = headerMorph?.title;
  const titleTargetTop = headerMorph?.headerSubtitle || fallbackHeader.subtitle ? 17 : 23;
  const titleTargetFontSize = 17;
  const titleAnimLeft = titleStart
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [titleStart.x, targetTitleLeft],
      })
    : undefined;
  const titleAnimTop = titleStart
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [titleStart.y, titleTargetTop],
      })
    : undefined;
  const titleAnimScale = titleStart
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, titleTargetFontSize / titleStart.fontSize],
      })
    : undefined;
  const titleAnimColor = titleStart
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [titleStart.color, colors.text],
      })
    : undefined;

  const storyThumbOpacity = progress.interpolate({
    inputRange: [0, 0.42],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const storyContentOpacity = progress.interpolate({
    inputRange: [0.16, 0.72],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const storyContentScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
    extrapolate: "clamp",
  });

  const renderStandardContent = () => {
    switch (payload.type) {
      case "comments":
        return (
          <CommentsView
            post={payload.post}
            reviews={
              reviewsMap[payload.post.id] ?? REVIEWS[payload.post.id] ?? []
            }
            hideHeader
            showComposer
          />
        );

      case "details":
        return (
          <DetailsView
            post={payload.post}
            hideHeader
            onNavigate={() => {
              const targetPost = payload.post;
              onRequestClose();
              setTimeout(() => startGuidance(targetPost), 220);
            }}
            onSelectPlace={(other) => {
              pushPopupPayload({ type: "details", post: other });
            }}
            onOpenProfile={() => {
              const targetPost = payload.post;
              onRequestClose();
              setTimeout(() => {
                router.push({
                  pathname: "/profile",
                  params: { author: targetPost.author, id: targetPost.id },
                });
              }, 240);
            }}
            onOpenReviews={() => {
              pushPopupPayload({ type: "comments", post: payload.post });
            }}
            showToast={showToast}
          />
        );

      case "post_options":
        return (
          <PostOptionsContent
            post={payload.post}
            saved={isSaved(payload.post.id)}
            onToggleSave={() => {
              const wasSaved = isSaved(payload.post.id);
              toggleSave(payload.post.id);
              showToast(
                wasSaved ? "Removed from saved" : "Saved to your places"
              );
            }}
            onShare={() => {
              Share.share({
                message: `${payload.post.title} — ${payload.post.author} (${payload.post.place}) on Olive!`,
              });
            }}
            onViewPlace={() => {
              pushPopupPayload({ type: "details", post: payload.post });
            }}
            onViewAuthor={() => {
              const targetPost = payload.post;
              onRequestClose();
              setTimeout(() => {
                router.push({
                  pathname: "/profile",
                  params: { author: targetPost.author, id: targetPost.id },
                });
              }, 240);
            }}
            onReport={() => {
              onRequestClose();
              showToast("Report submitted. Thank you!");
            }}
            onClose={onRequestClose}
          />
        );

      case "reshare": {
        const userReposted = isReposted(payload.post.id);
        const existingQuote = getUserQuoteNote(payload.post.id);
        return (
          <ReshareContent
            post={payload.post}
            isRepostedByMe={userReposted}
            existingQuoteNote={existingQuote}
            onInstantRepost={() => {
              if (!userReposted) {
                toggleRepost(payload.post.id);
              } else if (existingQuote) {
                removeRepost(payload.post.id);
                toggleRepost(payload.post.id);
              }
              showToast("Reposted to your profile");
            }}
            onSaveQuoteRepost={(note) => {
              setQuoteRepost(payload.post.id, note);
              showToast("Quote repost published");
            }}
            onRemoveRepost={() => {
              removeRepost(payload.post.id);
              showToast("Repost removed");
            }}
            onShareExternal={() => {
              Share.share({
                message: `${payload.post.title} — ${payload.post.author} (${payload.post.place}) on Olive!`,
              });
            }}
            onClose={onRequestClose}
          />
        );
      }

      case "reactions_list":
        return (
          <ReactionsListContent
            postId={payload.postId}
            postAuthor={payload.postAuthor}
          />
        );

      case "edit_profile":
        return (
          <EditProfileView
            profile={payload.profile}
            hideHeader
            onSave={(patch) => {
              updateProfileOverrides(patch);
              onRequestClose();
              showToast("Profile info updated");
            }}
          />
        );

      case "profile_visitors":
        return (
          <VisitorsView
            hideHeader
            onSelectVisitor={(visitor) => {
              onRequestClose();
              setTimeout(() => {
                router.push({
                  pathname: "/profile",
                  params: { author: visitor.name, id: visitor.id },
                });
              }, 240);
            }}
          />
        );

      case "message":
        return (
          <MessageView
            recipient={payload.recipient}
            hideHeader
            showComposer
            onSent={onRequestClose}
          />
        );

      case "profile_saved":
        return (
          <SavedView
            savedPosts={savedPosts}
            hideHeader
            onSelectPlace={(id) => {
              const p = getPostById(id);
              if (p) {
                pushPopupPayload({ type: "details", post: p });
              }
            }}
            onRemove={(id) => toggleSave(id)}
          />
        );

      case "profile_settings":
        return <SettingsView hideHeader />;

      case "report":
        return (
          <ReportView
            targetUser={payload.targetUser}
            hideHeader
            onSubmitReport={() => {
              onRequestClose();
              showToast("Report submitted. Thank you!");
            }}
          />
        );

      default:
        return null;
    }
  };

  // Header accessory for Details (Save bookmark) or Comments (count badge)
  const renderHeaderRightAction = () => {
    if (payload.type === "details") {
      const saved = isSaved(payload.post.id);
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove bookmark" : "Save place"}
          onPress={() => {
            toggleSave(payload.post.id);
            showToast(saved ? "Removed from saved" : "Saved to your places");
          }}
          style={({ pressed }) => [
            styles.headerActionBtn,
            saved && styles.headerActionBtnSaved,
            pressed && styles.pressed,
          ]}
        >
          <Bookmark
            size={16}
            color={saved ? colors.signal : colors.text}
            fill={saved ? colors.signal : "none"}
          />
        </Pressable>
      );
    }

    if (payload.type === "comments") {
      const reviews =
        reviewsMap[payload.post.id] ?? REVIEWS[payload.post.id] ?? [];
      return (
        <View style={styles.headerCountBadge}>
          <Text style={styles.headerCountText}>
            {reviews.length} {reviews.length === 1 ? "note" : "notes"}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      {/* Blurred / Dimmed Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: backdropOpacity },
        ]}
      >
        <BlurView
          blurTarget={appBlurTargetRef}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={isImageViewer ? (Platform.OS === "ios" ? 80 : 95) : 45}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            isImageViewer
              ? isDark
                ? styles.imageBlurTintDark
                : styles.imageBlurTintLight
              : { backgroundColor: colors.overlay },
            Platform.OS === "web"
              ? ({
                  backdropFilter: isImageViewer ? "blur(28px)" : "blur(12px)",
                  WebkitBackdropFilter: isImageViewer
                    ? "blur(28px)"
                    : "blur(12px)",
                } as any)
              : null,
          ]}
        />
        <Pressable
          accessibilityLabel="Close popup"
          onPress={onRequestClose}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Subtle Floating Close Button for Image Lightbox */}
      {isImageViewer && (
        <Animated.View
          style={[
            styles.imageCloseWrap,
            {
              top: Math.max(16, insets.top + 12),
              opacity: headerExtraOpacity,
            },
          ]}
          pointerEvents={closing ? "none" : "box-none"}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close image"
            onPress={onRequestClose}
            style={({ pressed }) => [
              styles.imageCloseBtn,
              pressed && styles.pressed,
            ]}
          >
            <X size={18} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      )}

      {/* Morphing Window Shell */}
      <Animated.View
        style={[
          styles.morphCard,
          {
            left: animLeft,
            top: animTop,
            width: animWidth,
            height: animHeight,
            borderRadius: animRadius,
            backgroundColor: animBg,
            borderColor: animBorderColor,
            borderWidth: animBorderWidth,
          },
        ]}
      >
        {/* 1. Image Viewer Mode */}
        {payload.type === "image_viewer" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close zoomed image"
            onPress={onRequestClose}
            style={styles.imageFillPressable}
          >
            <Image
              source={payload.image}
              style={styles.fullImage}
              resizeMode="cover"
            />
          </Pressable>
        )}

        {/* 2. Story Viewer Mode */}
        {payload.type === "story" && (() => {
          const activeIdx = payload.activeIndex ?? payload.initialIndex;
          const activeStory = STORIES[activeIdx] ?? STORIES[0];
          return (
            <View style={styles.storyShell}>
              {/* Initial story thumbnail that smoothly expands & crossfades */}
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { opacity: storyThumbOpacity },
                ]}
              >
                <Image
                  source={activeStory.avatar}
                  style={styles.fullImage}
                  resizeMode="cover"
                />
              </Animated.View>

              {/* Full Story Viewer fixed to target dimensions so no text/layout jitter */}
              <Animated.View
                style={[
                  styles.storyFixedFrame,
                  {
                    width: target.width - target.borderWidth * 2,
                    height: target.height - target.borderWidth * 2,
                    opacity: storyContentOpacity,
                    transform: [{ scale: storyContentScale }],
                  },
                ]}
                pointerEvents={closing ? "none" : "auto"}
              >
                <StoryPopupContent
                  activeIndex={activeIdx}
                  onIndexChange={(nextIndex) =>
                    updatePopupPayload({
                      type: "story",
                      initialIndex: payload.initialIndex,
                      activeIndex: nextIndex,
                    })
                  }
                  onClose={onRequestClose}
                  onNavigateToPlace={(story) => {
                    if (story.isOwner) {
                      onRequestClose();
                      setTimeout(() => router.push("/profile"), 240);
                    } else if (story.targetPostId) {
                      const targetPost = getPostById(story.targetPostId);
                      if (targetPost) {
                        pushPopupPayload({ type: "details", post: targetPost });
                      }
                    }
                  }}
                />
              </Animated.View>
            </View>
          );
        })()}

        {/* 3. Standard Morphing Card Pop-Up */}
        {isStandardCard && (
          <View style={styles.cardInner}>
            {/* Ghost content from source pill (dissolves quickly at start of expand) */}
            {headerMorph?.ghostContent && history.length === 0 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.ghostLayer,
                  {
                    width: activeSourceRect.width,
                    height: activeSourceRect.height,
                    opacity: ghostOpacity,
                  },
                ]}
              >
                {headerMorph.ghostContent}
              </Animated.View>
            )}

            {/* Shared Icon Badge Background (fades in at header position) */}
            {hasSharedIcon && history.length === 0 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.headerIconBadge,
                  {
                    backgroundColor:
                      iconStart?.targetBgColor ?? colors.surfaceMuted,
                    opacity: headerExtraOpacity,
                  },
                ]}
              />
            )}

            {/* Gliding Shared Icon (moves from source pill -> window header) */}
            {iconStart &&
              history.length === 0 &&
              iconAnimLeft &&
              iconAnimTop &&
              iconAnimScale && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.glidingElement,
                    {
                      left: iconAnimLeft,
                      top: iconAnimTop,
                      transform: [{ scale: iconAnimScale }],
                    },
                  ]}
                >
                  {iconStart.render(iconStart.color, iconStart.size)}
                </Animated.View>
              )}

            {/* Gliding Shared Title Text (moves from source pill -> window header) */}
            {titleStart &&
              history.length === 0 &&
              titleAnimLeft &&
              titleAnimTop &&
              titleAnimScale &&
              titleAnimColor && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.glidingTitleWrap,
                    {
                      left: titleAnimLeft,
                      top: titleAnimTop,
                      transform: [{ scale: titleAnimScale }],
                    },
                  ]}
                >
                  <Animated.Text
                    numberOfLines={1}
                    style={[
                      styles.glidingTitleText,
                      {
                        fontSize: titleStart.fontSize,
                        fontWeight: "800",
                        color: titleAnimColor,
                      },
                    ]}
                  >
                    {titleStart.text}
                  </Animated.Text>
                </Animated.View>
              )}

            {/* Header Bar (Drag handle + Back button + Fade-in title/subtitle + Right actions + Close) */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.cardHeader, { width: target.width - 2 }]}
            >
              <Animated.View
                style={[styles.dragHandleRow, { opacity: headerExtraOpacity }]}
              >
                <View style={styles.dragHandleBar} />
              </Animated.View>

              <Animated.View
                style={[
                  styles.headerMainRow,
                  { opacity: headerExtraOpacity },
                ]}
              >
                {/* Back button when navigated deeper inside the popup */}
                {history.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    onPress={popPopupPayload}
                    style={({ pressed }) => [
                      styles.headerBackBtn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ArrowLeft size={17} color={colors.text} />
                  </Pressable>
                ) : !hasSharedIcon ? null : (
                  <View style={styles.headerIconSpacer} />
                )}

                {/* Title & Subtitle */}
                <Animated.View
                  style={[
                    styles.headerTitleCol,
                    !hasSharedTitle && {
                      transform: [{ translateX: headerTitleSlideX }],
                    },
                  ]}
                >
                  {!hasSharedTitle ? (
                    <Text numberOfLines={1} style={styles.headerTitle}>
                      {headerMorph?.headerTitle ?? fallbackHeader.title}
                    </Text>
                  ) : (
                    /* Invisible spacer matching moved title height so subtitle stays aligned */
                    <Text numberOfLines={1} style={[styles.headerTitle, { opacity: 0 }]}>
                      {titleStart?.text}
                    </Text>
                  )}
                  {(headerMorph?.headerSubtitle ?? fallbackHeader.subtitle) && (
                    <Text numberOfLines={1} style={styles.headerSubtitle}>
                      {headerMorph?.headerSubtitle ?? fallbackHeader.subtitle}
                    </Text>
                  )}
                </Animated.View>

                <View style={styles.headerRightGroup}>
                  {renderHeaderRightAction()}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close window"
                    onPress={onRequestClose}
                    style={({ pressed }) => [
                      styles.headerCloseBtn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </Pressable>
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.headerDivider,
                  { opacity: headerExtraOpacity },
                ]}
              />
            </Animated.View>

            {/* Fixed-Width Body Content (prevents text reflow jitter during expand) */}
            <Animated.View
              style={[
                styles.bodyWrap,
                {
                  width: target.width - 2,
                  height: Math.max(120, target.height - HEADER_HEIGHT - 2),
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }],
                },
              ]}
              pointerEvents={closing ? "none" : "auto"}
            >
              {renderStandardContent()}
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlayRoot: {
      ...StyleSheet.absoluteFill,
      zIndex: 100,
    },
    imageBlurTintLight: {
      backgroundColor: "rgba(250, 248, 245, 0.35)",
    },
    imageBlurTintDark: {
      backgroundColor: "rgba(12, 11, 10, 0.55)",
    },
    imageCloseWrap: {
      position: "absolute",
      right: 16,
      zIndex: 120,
    },
    imageCloseBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    morphCard: {
      position: "absolute",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.28,
      shadowRadius: 28,
      elevation: 18,
    },
    imageFillPressable: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    fullImage: {
      width: "100%",
      height: "100%",
    },
    storyShell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    storyFixedFrame: {
      overflow: "hidden",
    },
    cardInner: {
      flex: 1,
      position: "relative",
    },
    ghostLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 2,
    },
    headerIconBadge: {
      position: "absolute",
      left: 16,
      top: 18,
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.line,
      zIndex: 4,
    },
    glidingElement: {
      position: "absolute",
      zIndex: 15,
      transformOrigin: "center center",
    },
    glidingTitleWrap: {
      position: "absolute",
      zIndex: 15,
      transformOrigin: "left top",
    },
    glidingTitleText: {
      letterSpacing: -0.2,
    },
    cardHeader: {
      height: HEADER_HEIGHT,
      position: "relative",
      zIndex: 10,
    },
    dragHandleRow: {
      height: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 4,
    },
    dragHandleBar: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
    },
    headerMainRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      gap: 10,
    },
    headerBackBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.line,
      alignItems: "center",
      justifyContent: "center",
    },
    headerIconSpacer: {
      width: 34,
      height: 34,
    },
    headerTitleCol: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.25,
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 1,
    },
    headerRightGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerActionBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.line,
    },
    headerActionBtnSaved: {
      borderColor: colors.signal,
    },
    headerCountBadge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
    },
    headerCountText: {
      fontSize: 11.5,
      fontWeight: "700",
      color: colors.signal,
    },
    headerCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    headerDivider: {
      height: 1,
      backgroundColor: colors.line,
      marginHorizontal: 0,
    },
    bodyWrap: {
      overflow: "hidden",
    },
    pressed: {
      opacity: 0.7,
    },
  });

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import type { GuidanceSession, Post, PostReactions, ReactionType, Review, SearchMode, SettingsState } from "../models";
import {
  DEFAULT_SAVED_IDS,
  DEFAULT_SETTINGS,
  loadSavedIds,
  loadSettings,
  saveSavedIds,
  saveSettings,
} from "../storage";
import { getPalette, type ColorPalette } from "../constants/colors";
import { estimateTravelMinutes, generateGuidanceSteps, REVIEWS } from "../places";
import type { UserProfile } from "../profiles";
import type {
  ActivePopupState,
  PopupOrigin,
  PopupPayload,
} from "../components/popup/popupTypes";

export type FeedMode = "all" | "people" | "places";

export type ExpandedWindow =
  | { type: "profile_saved" }
  | { type: "profile_settings" }
  | { type: "message"; recipient: UserProfile }
  | { type: "report"; targetUser: UserProfile }
  | { type: "search_options" }
  | { type: "user_menu" }
  | { type: "notifications" }
  | null;

export type ProfileOverrides = {
  name?: string;
  neighborhood?: string;
  bio?: string;
};

export type ProfileTab =
  | "posts"
  | "reposted"
  | "interacted";

type OliveContextType = {
  config: SettingsState;
  colors: ColorPalette;
  isDark: boolean;
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<SettingsState>) => Promise<void>;
  resetSettings: () => Promise<void>;

  // Feed mode state (all vs people vs places)
  feedMode: FeedMode;
  setFeedMode: (mode: FeedMode | ((prev: FeedMode) => FeedMode)) => void;

  // Search state for the bottom floating dock
  activeMode: SearchMode | null;
  setActiveMode: (mode: SearchMode | null) => void;
  isListening: boolean;
  setIsListening: (listening: boolean | ((prev: boolean) => boolean)) => void;
  typeQuery: string;
  setTypeQuery: (q: string) => void;
  closeSearch: () => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean | ((prev: boolean) => boolean)) => void;

  // Profile screen tab state (synced with header)
  profileTab: ProfileTab;
  setProfileTab: (tab: ProfileTab | ((prev: ProfileTab) => ProfileTab)) => void;

  // Liked & Reposted state
  likedIds: string[];
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;
  repostedIds: string[];
  isReposted: (id: string) => boolean;
  toggleRepost: (id: string) => void;
  quoteRepostsMap: Record<string, string>;
  getUserQuoteNote: (postId: string) => string | null;
  setQuoteRepost: (postId: string, note: string) => void;
  removeRepost: (postId: string) => void;

  // Reactions state (multi-reaction system)
  reactionsMap: Record<string, PostReactions>;
  getUserReaction: (postId: string) => ReactionType | null;
  setReaction: (postId: string, reaction: ReactionType) => void;
  removeReaction: (postId: string) => void;

  // Expanded floating nav window state (dock-triggered windows only)
  expandedWindow: ExpandedWindow;
  openExpandedWindow: (win: ExpandedWindow) => void;
  closeExpandedWindow: () => void;

  // Standalone morphing pop-up window state (non-dock pressables)
  rootContainerRef: RefObject<View | null>;
  rootDims: { width: number; height: number };
  setRootDims: (dims: { width: number; height: number }) => void;
  activePopup: ActivePopupState | null;
  activeTriggerId: string | null;
  openPopup: (payload: PopupPayload, origin: PopupOrigin) => void;
  pushPopupPayload: (payload: PopupPayload) => void;
  popPopupPayload: () => void;
  updatePopupPayload: (payload: PopupPayload) => void;
  closePopup: () => void;
  clearPopup: () => void;

  // Global toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Realtime comments / reviews state
  reviewsMap: Record<string, Review[]>;
  addReview: (postId: string, review: Review) => void;

  // Own-profile editable info overrides
  profileOverrides: ProfileOverrides;
  updateProfileOverrides: (patch: ProfileOverrides) => void;

  // Scanning state for home feed live scanning vs paused
  isScanning: boolean;
  setIsScanning: (
    scanning: boolean | ((prev: boolean) => boolean),
  ) => void;

  // In-app Guidance state
  activeGuidance: GuidanceSession | null;
  startGuidance: (post: Post) => void;
  nextGuidanceStep: () => void;
  stopGuidance: () => void;
};

const Context = createContext<OliveContextType | null>(null);

export function OliveProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [savedIds, setSavedIds] = useState<string[]>(DEFAULT_SAVED_IDS);
  const [ready, setReady] = useState(false);

  // Feed mode (all vs people vs places)
  const [feedMode, setFeedMode] = useState<FeedMode>("all");

  // Search state
  const [activeMode, setActiveMode] = useState<SearchMode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Profile screen tab state (defaults to "posts" as first tab)
  const [profileTab, setProfileTab] = useState<ProfileTab>("posts");

  // Liked & Reposted posts tracking
  const [likedIds, setLikedIds] = useState<string[]>([
    "park-live",
    "forno",
    "kuchawe-chambo",
  ]);
  const [repostedIds, setRepostedIds] = useState<string[]>([
    "park-live",
    "saturday-market",
  ]);
  const [quoteRepostsMap, setQuoteRepostsMap] = useState<Record<string, string>>({});

  const isLiked = (id: string) => likedIds.includes(id);
  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isReposted = (id: string) => repostedIds.includes(id);
  const toggleRepost = (id: string) => {
    setRepostedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        setQuoteRepostsMap((qPrev) => {
          if (!(id in qPrev)) return qPrev;
          const next = { ...qPrev };
          delete next[id];
          return next;
        });
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const getUserQuoteNote = (postId: string): string | null => {
    return quoteRepostsMap[postId] ?? null;
  };

  const setQuoteRepost = (postId: string, note: string) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    setRepostedIds((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
    setQuoteRepostsMap((prev) => ({ ...prev, [postId]: trimmed }));
  };

  const removeRepost = (postId: string) => {
    setRepostedIds((prev) => prev.filter((item) => item !== postId));
    setQuoteRepostsMap((prev) => {
      if (!(postId in prev)) return prev;
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  };

  // Reactions state (multi-reaction system)
  // userReactions tracks which reaction the current user chose per post
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({
    "park-live": "heart",
    "forno": "heart",
    "kuchawe-chambo": "flower",
  });
  // reactionsMap tracks the aggregate count of each reaction type per post
  const [reactionsMap, setReactionsMap] = useState<Record<string, PostReactions>>({
    "park-live": { heart: 5, flower: 3, like: 2, laugh: 1, fire: 0, clap: 0 },
    "forno": { heart: 8, flower: 1, like: 0, laugh: 2, fire: 1, clap: 0 },
    "kuchawe-chambo": { heart: 3, flower: 6, like: 1, laugh: 0, fire: 2, clap: 1 },
    "saturday-market": { heart: 4, flower: 2, like: 3, laugh: 1, fire: 0, clap: 0 },
    "area18-guavas-note": { heart: 7, flower: 0, like: 4, laugh: 0, fire: 0, clap: 5 },
    "kondwani-repost-lingadzi": { heart: 24, flower: 14, like: 9, laugh: 2, fire: 19, clap: 15 },
    "dalitso-quote-forno": { heart: 16, flower: 7, like: 5, laugh: 1, fire: 12, clap: 8 },
  });

  const getUserReaction = (postId: string): ReactionType | null => {
    return userReactions[postId] ?? null;
  };

  const setReaction = (postId: string, reaction: ReactionType) => {
    const previousReaction = userReactions[postId];
    // Update user's reaction
    setUserReactions((prev) => ({ ...prev, [postId]: reaction }));
    // Update aggregate counts
    setReactionsMap((prev) => {
      const current = prev[postId] ?? { heart: 0, flower: 0, like: 0, laugh: 0, fire: 0, clap: 0 };
      const updated = { ...current };
      // Remove previous reaction if any
      if (previousReaction && updated[previousReaction] > 0) {
        updated[previousReaction] -= 1;
      }
      // Add new reaction
      updated[reaction] = (updated[reaction] ?? 0) + 1;
      return { ...prev, [postId]: updated };
    });
    // Also keep likedIds in sync for backward compatibility
    if (reaction === "heart") {
      setLikedIds((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
    } else {
      setLikedIds((prev) => prev.filter((item) => item !== postId));
    }
  };

  const removeReaction = (postId: string) => {
    const previousReaction = userReactions[postId];
    if (!previousReaction) return;
    // Remove user's reaction
    setUserReactions((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    // Update aggregate counts
    setReactionsMap((prev) => {
      const current = prev[postId];
      if (!current) return prev;
      const updated = { ...current };
      if (updated[previousReaction] > 0) {
        updated[previousReaction] -= 1;
      }
      return { ...prev, [postId]: updated };
    });
    // Remove from likedIds for backward compat
    setLikedIds((prev) => prev.filter((item) => item !== postId));
  };

  // Expanded floating nav window state (dock-triggered windows)
  const [expandedWindow, setExpandedWindow] = useState<ExpandedWindow>(null);

  // Standalone morphing pop-up window state (non-dock pressables)
  const rootContainerRef = useRef<View | null>(null);
  const [rootDims, setRootDims] = useState(() => {
    const win = Dimensions.get("window");
    return { width: win.width, height: win.height };
  });
  const popupSeqRef = useRef(0);
  const [activePopup, setActivePopup] = useState<ActivePopupState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2400);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Dynamic reviews / comments state
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>(REVIEWS);

  // Own-profile editable info overrides
  const [profileOverrides, setProfileOverrides] = useState<ProfileOverrides>({});
  const updateProfileOverrides = (patch: ProfileOverrides) => {
    setProfileOverrides((prev) => ({ ...prev, ...patch }));
  };

  const openExpandedWindow = (win: ExpandedWindow) => {
    setActivePopup(null);
    setExpandedWindow(win);
  };

  const closeExpandedWindow = () => {
    setExpandedWindow(null);
  };

  const openPopup = (payload: PopupPayload, origin: PopupOrigin) => {
    setExpandedWindow(null);
    setActiveMode(null);
    setIsListening(false);
    popupSeqRef.current += 1;
    setActivePopup({
      id: popupSeqRef.current,
      payload,
      history: [],
      origin,
      closing: false,
    });
  };

  const pushPopupPayload = (payload: PopupPayload) => {
    setActivePopup((prev) =>
      prev
        ? {
            ...prev,
            history: [...prev.history, prev.payload],
            payload,
          }
        : prev
    );
  };

  const popPopupPayload = () => {
    setActivePopup((prev) => {
      if (!prev || prev.history.length === 0) return prev;
      const nextHistory = [...prev.history];
      const previousPayload = nextHistory.pop()!;
      return {
        ...prev,
        history: nextHistory,
        payload: previousPayload,
      };
    });
  };

  const updatePopupPayload = (payload: PopupPayload) => {
    setActivePopup((prev) => (prev ? { ...prev, payload } : prev));
  };

  const closePopup = () => {
    setActivePopup((prev) => (prev ? { ...prev, closing: true } : prev));
  };

  const clearPopup = () => {
    setActivePopup(null);
  };

  const activeTriggerId = activePopup?.origin.triggerId ?? null;

  const addReview = (postId: string, review: Review) => {
    setReviewsMap((prev) => {
      const existing = prev[postId] ?? REVIEWS[postId] ?? [];
      return {
        ...prev,
        [postId]: [review, ...existing],
      };
    });
  };

  // Scanning state (live feed realtime syncing vs paused - defaults to false)
  const [isScanning, setIsScanning] = useState(false);

  // In-app Guidance state
  const [activeGuidance, setActiveGuidance] = useState<GuidanceSession | null>(
    null,
  );

  const configRef = useRef(config);
  configRef.current = config;
  const savedIdsRef = useRef(savedIds);
  savedIdsRef.current = savedIds;

  useEffect(() => {
    Promise.all([loadSettings(), loadSavedIds()])
      .then(([savedConfig, loadedIds]) => {
        setConfig(savedConfig);
        setSavedIds(loadedIds);
      })
      .finally(() => setReady(true));
  }, []);

  async function updateSettings(patch: Partial<SettingsState>) {
    const next = { ...configRef.current, ...patch };
    setConfig(next);
    await saveSettings(next);
  }

  async function resetSettings() {
    setConfig(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
  }

  function isSaved(id: string): boolean {
    return savedIds.includes(id);
  }

  async function toggleSave(id: string) {
    const next = savedIdsRef.current.includes(id)
      ? savedIdsRef.current.filter((item) => item !== id)
      : [...savedIdsRef.current, id];
    setSavedIds(next);
    await saveSavedIds(next);
  }

  function closeSearch() {
    setActiveMode(null);
    setIsListening(false);
    setTypeQuery("");
    setIsSearching(false);
    setExpandedWindow(null);
  }

  function startGuidance(post: Post) {
    const steps = generateGuidanceSteps(post);
    const etaMinutes = estimateTravelMinutes(post.distanceKm, config.mode);
    setActiveGuidance({
      post,
      mode: config.mode,
      etaMinutes,
      distanceRemainingKm: post.distanceKm,
      steps,
      currentStepIndex: 0,
    });
  }

  function nextGuidanceStep() {
    setActiveGuidance((current) => {
      if (!current) return null;
      if (current.currentStepIndex < current.steps.length - 1) {
        return {
          ...current,
          currentStepIndex: current.currentStepIndex + 1,
        };
      }
      return current;
    });
  }

  function stopGuidance() {
    setActiveGuidance(null);
  }

  const isDark = !!config.dark;
  const colors = getPalette(isDark);

  return (
    <Context.Provider
      value={{
        config,
        colors,
        isDark,
        savedIds,
        isSaved,
        toggleSave,
        updateSettings,
        resetSettings,
        feedMode,
        setFeedMode,
        activeMode,
        setActiveMode,
        isListening,
        setIsListening,
        typeQuery,
        setTypeQuery,
        closeSearch,
        isSearching,
        setIsSearching,
        profileTab,
        setProfileTab,
        likedIds,
        isLiked,
        toggleLike,
        repostedIds,
        isReposted,
        toggleRepost,
        quoteRepostsMap,
        getUserQuoteNote,
        setQuoteRepost,
        removeRepost,
        reactionsMap,
        getUserReaction,
        setReaction,
        removeReaction,
        expandedWindow,
        openExpandedWindow,
        closeExpandedWindow,
        rootContainerRef,
        rootDims,
        setRootDims,
        activePopup,
        activeTriggerId,
        openPopup,
        pushPopupPayload,
        popPopupPayload,
        updatePopupPayload,
        closePopup,
        clearPopup,
        toastMessage,
        showToast,
        reviewsMap,
        addReview,
        profileOverrides,
        updateProfileOverrides,
        isScanning,
        setIsScanning,
        activeGuidance,
        startGuidance,
        nextGuidanceStep,
        stopGuidance,
      }}
    >
      {ready ? (
        children
      ) : (
        <Splash colors={colors} />
      )}
    </Context.Provider>
  );
}

function Splash({ colors }: { colors: ColorPalette }) {
  const styles = createSplashStyles(colors);
  return (
    <View style={styles.splash}>
      <Text style={styles.brandText}>
        olive<Text style={styles.brandDot}>.</Text>
      </Text>
      <ActivityIndicator color={colors.signal} size="small" />
    </View>
  );
}

export function useOlive() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useOlive must be used within an OliveProvider");
  }
  return value;
}

const createSplashStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    splash: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      backgroundColor: colors.bg,
    },
    brandText: {
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -1,
      color: colors.text,
    },
    brandDot: {
      color: colors.signal,
    },
  });

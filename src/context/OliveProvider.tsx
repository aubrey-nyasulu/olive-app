import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { GuidanceSession, Post, Review, SearchMode, SettingsState } from "../models";
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

export type FeedMode = "all" | "people" | "places";

export type ExpandedWindow =
  | { type: "comments"; post: Post }
  | { type: "details"; post: Post }
  | { type: "related"; post: Post }
  | { type: "profile_saved" }
  | { type: "profile_settings" }
  | { type: "message"; recipient: UserProfile }
  | { type: "report"; targetUser: UserProfile }
  | { type: "feed_modes" }
  | { type: "search_options" }
  | { type: "user_menu" }
  | { type: "notifications" }
  | null;

export type ProfileTab =
  | "posts"
  | "reposted"
  | "interacted"
  | "about";

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
  searchOpen: boolean;
  setSearchOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  activeMode: SearchMode | null;
  setActiveMode: (mode: SearchMode | null) => void;
  isListening: boolean;
  setIsListening: (listening: boolean | ((prev: boolean) => boolean)) => void;
  typeQuery: string;
  setTypeQuery: (q: string) => void;
  closeSearch: () => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean | ((prev: boolean) => boolean)) => void;

  // Profile screen tab state (synced with bottom floating dock & header)
  profileTab: ProfileTab;
  setProfileTab: (
    tab:
      | ProfileTab
      | "settings"
      | ((prev: ProfileTab) => ProfileTab)
  ) => void;

  // Liked & Reposted state
  likedIds: string[];
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;
  repostedIds: string[];
  isReposted: (id: string) => boolean;
  toggleRepost: (id: string) => void;

  // Profile modal sheet state (Saved / Settings popup)
  profileModal: "saved" | "settings" | null;
  setProfileModal: (
    modal:
      | "saved"
      | "settings"
      | null
      | ((prev: "saved" | "settings" | null) => "saved" | "settings" | null)
  ) => void;

  // Expanded floating nav window state
  expandedWindow: ExpandedWindow;
  openExpandedWindow: (win: ExpandedWindow) => void;
  closeExpandedWindow: () => void;

  // Realtime comments / reviews state
  reviewsMap: Record<string, Review[]>;
  addReview: (postId: string, review: Review) => void;

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<SearchMode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Profile screen tab state (defaults to "about" as first tab)
  const [profileTab, setProfileTabState] = useState<ProfileTab>("about");

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

  const isLiked = (id: string) => likedIds.includes(id);
  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isReposted = (id: string) => repostedIds.includes(id);
  const toggleRepost = (id: string) => {
    setRepostedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Expanded floating nav window state
  const [expandedWindow, setExpandedWindow] = useState<ExpandedWindow>(null);

  // Dynamic reviews / comments state
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>(REVIEWS);

  const openExpandedWindow = (win: ExpandedWindow) => {
    setExpandedWindow(win);
  };

  const closeExpandedWindow = () => {
    setExpandedWindow(null);
  };

  const addReview = (postId: string, review: Review) => {
    setReviewsMap((prev) => {
      const existing = prev[postId] ?? REVIEWS[postId] ?? [];
      return {
        ...prev,
        [postId]: [review, ...existing],
      };
    });
  };

  // Derive profileModal for backward compatibility
  const profileModal =
    expandedWindow?.type === "profile_saved"
      ? "saved"
      : expandedWindow?.type === "profile_settings"
      ? "settings"
      : null;

  const setProfileModal = (
    modal:
      | "saved"
      | "settings"
      | null
      | ((prev: "saved" | "settings" | null) => "saved" | "settings" | null)
  ) => {
    const nextModal = typeof modal === "function" ? modal(profileModal) : modal;
    if (nextModal === "saved") {
      setExpandedWindow({ type: "profile_saved" });
    } else if (nextModal === "settings") {
      setExpandedWindow({ type: "profile_settings" });
    } else {
      if (
        expandedWindow?.type === "profile_saved" ||
        expandedWindow?.type === "profile_settings"
      ) {
        setExpandedWindow(null);
      }
    }
  };

  const setProfileTab = (
    tab:
      | ProfileTab
      | "settings"
      | ((prev: ProfileTab) => ProfileTab)
  ) => {
    if (tab === "settings") {
      setExpandedWindow({ type: "profile_settings" });
    } else if (typeof tab === "function") {
      setProfileTabState(tab);
    } else {
      setProfileTabState(tab);
    }
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
    setSearchOpen(false);
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
        searchOpen,
        setSearchOpen,
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
        profileModal,
        setProfileModal,
        expandedWindow,
        openExpandedWindow,
        closeExpandedWindow,
        reviewsMap,
        addReview,
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

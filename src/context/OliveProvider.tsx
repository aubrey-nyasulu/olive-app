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
import { Colors, palette } from "../theme";
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

type OliveContextType = {
  config: SettingsState;
  colors: Colors;
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
  profileTab: "posts" | "about";
  setProfileTab: (
    tab:
      | "posts"
      | "about"
      | "saved"
      | "settings"
      | ((prev: "posts" | "about") => "posts" | "about")
  ) => void;

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
  const [profileTab, setProfileTabState] = useState<"about" | "posts">("about");

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
      | "posts"
      | "about"
      | "saved"
      | "settings"
      | ((prev: "posts" | "about") => "posts" | "about")
  ) => {
    if (tab === "saved") {
      setExpandedWindow({ type: "profile_saved" });
    } else if (tab === "settings") {
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

  const colors = palette(config.dark);

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

  return (
    <Context.Provider
      value={{
        config,
        colors,
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
        <View style={[styles.splash, { backgroundColor: colors.bg }]}>
          <Text style={[styles.brandText, { color: colors.text }]}>
            olive<Text style={{ color: colors.signal }}>.</Text>
          </Text>
          <ActivityIndicator color={colors.signal} size="small" />
        </View>
      )}
    </Context.Provider>
  );
}

export function useOlive() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useOlive must be used within an OliveProvider");
  }
  return value;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  brandText: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
});

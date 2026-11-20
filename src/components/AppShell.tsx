import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";
import { getProfile } from "../profiles";
import { GuidanceModal } from "./GuidanceModal";
import { TypeSearch, VisualSearch } from "./SearchModes";
import { FloatingDock } from "./dock/FloatingDock";

export function AppShell({ children }: { children: ReactNode }) {
  const { styles, colors } = useThemeStyles(createStyles);
  const {
    searchOpen,
    activeMode,
    typeQuery,
    setTypeQuery,
    closeSearch,
    setIsSearching,
    expandedWindow,
    closeExpandedWindow,
  } = useOlive();

  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;
  const normalDockBottom = Math.max(20, insets.bottom + 8);
  const normalPanelBottom = normalDockBottom + 72;
  const maxPanelHeight = Math.min(screenHeight * 0.58, 460);

  const pathname = usePathname();
  const { author, id } = useGlobalSearchParams<{
    author?: string;
    id?: string;
  }>();
  const currentProfile = getProfile(author || id);
  const onFeed = pathname === "/";
  const onProfile = pathname === "/profile";
  const isOtherUser =
    onProfile &&
    currentProfile.id !== "chisomo" &&
    currentProfile.id !== "amara";
  const showDock = onFeed || onProfile;
  const panelOpen = activeMode !== null;
  const isExpanded = expandedWindow !== null;

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2400);
  };

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setScreenHeight(window.height);
    });
    return () => sub.remove();
  }, []);

  // Keyboard avoidance offset
  useEffect(() => {
    const handleShow = (e: KeyboardEvent) => {
      const kh = e.endCoordinates.height;
      if (!kh || kh <= 0) return;
      setKeyboardHeight(kh);
      const shift = Math.max(0, kh + 28 - normalDockBottom);
      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: shift,
        duration,
        useNativeDriver: true,
      }).start();
    };

    const handleHide = (e: KeyboardEvent) => {
      setKeyboardHeight(0);
      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start();
    };

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
  }, [keyboardShiftAnim, normalDockBottom]);

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setProfileMenuOpen(false);
    closeSearch();
  };

  return (
    <View style={styles.root}>
      <View style={styles.contentWrap}>{children}</View>

      {/* Dimmed backdrop when expanded dock, search, panel, or profile menu is active */}
      {(isExpanded || searchOpen || panelOpen || profileMenuOpen) && (
        <Pressable
          accessibilityLabel="Dismiss overlay"
          onPress={() => {
            closeExpandedWindow();
            handleCloseSearch();
          }}
          style={styles.backdrop}
        />
      )}

      {/* Mode Search Content Panel (Type / Visual) */}
      {panelOpen && activeMode !== "voice" && (
        <Animated.View
          style={[
            styles.panelContainer,
            {
              bottom: normalPanelBottom,
              maxHeight: maxPanelHeight,
              transform: [
                { translateY: Animated.multiply(keyboardShiftAnim, -1) },
              ],
            },
          ]}
        >
          <View style={styles.panelCard}>
            {activeMode === "type" && (
              <TypeSearch
                query={typeQuery}
                onSelectCategory={(cat) => {
                  setTypeQuery(cat);
                  setIsSearching(true);
                  setTimeout(() => setIsSearching(false), 1800);
                }}
                onClose={handleCloseSearch}
              />
            )}
            {activeMode === "visual" && <VisualSearch />}
          </View>
        </Animated.View>
      )}

      {/* Floating Bottom Dock (Collapsible & Height-Expanding) */}
      {showDock && (
        <FloatingDock
          currentProfile={currentProfile}
          isOtherUser={isOtherUser}
          profileMenuOpen={profileMenuOpen}
          setProfileMenuOpen={setProfileMenuOpen}
          showToast={showToast}
        />
      )}

      {/* Floating In-App Toast */}
      {toastMessage && (
        <View
          style={[
            styles.floatingToast,
            {
              bottom: normalDockBottom + 76,
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={16} color={colors.signal} />
          <Text style={styles.floatingToastText}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* Global In-App Turn-By-Turn Guidance Experience */}
      <GuidanceModal />
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    contentWrap: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      zIndex: 40,
      backgroundColor: colors.overlay,
    },
    panelContainer: {
      position: "absolute",
      left: 16,
      right: 16,
      zIndex: 45,
      alignItems: "center",
    },
    panelCard: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 24,
      borderWidth: 1,
      overflow: "hidden",
      backgroundColor: colors.bg,
      borderColor: colors.line,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 16,
      elevation: 8,
    },
    floatingToast: {
      position: "absolute",
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      zIndex: 60,
      backgroundColor: colors.text,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 6,
    },
    floatingToastText: {
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.1,
      color: colors.bg,
    },
  });

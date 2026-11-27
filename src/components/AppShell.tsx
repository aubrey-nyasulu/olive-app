import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { BlurTargetView } from "expo-blur";
import { useGlobalSearchParams, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";
import { getProfile } from "../profiles";
import { GuidanceModal } from "./GuidanceModal";
import { TypeSearch, VisualSearch } from "./SearchModes";
import { FloatingDock } from "./dock/FloatingDock";
import { MorphPopupOverlay } from "./popup/MorphPopupOverlay";

export function AppShell({ children }: { children: ReactNode }) {
  const { styles, colors } = useThemeStyles(createStyles);
  const {
    activeMode,
    typeQuery,
    setTypeQuery,
    closeSearch,
    setIsSearching,
    expandedWindow,
    closeExpandedWindow,
    rootContainerRef,
    setRootDims,
    toastMessage,
    showToast,
  } = useOlive();

  const appBlurTargetRef = useRef<View | null>(null);

  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );

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
      const shift = Math.max(0, kh + 28 - normalDockBottom);
      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: shift,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const handleHide = (e: KeyboardEvent) => {
      const duration = Platform.OS === "ios" ? e.duration ?? 250 : 180;

      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration,
        useNativeDriver: false,
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
    <View
      ref={rootContainerRef}
      collapsable={false}
      style={styles.root}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setRootDims({ width, height });
        }
      }}
    >
      <BlurTargetView
        ref={appBlurTargetRef}
        collapsable={false}
        style={styles.contentWrap}
      >
        {children}
      </BlurTargetView>

      {/* Dimmed backdrop when expanded dock, panel, or profile menu is active */}
      {(isExpanded || panelOpen || profileMenuOpen) && (
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

      {/* Standalone Morphing Pop-Up Windows (non-dock pressables & image lightbox) */}
      <MorphPopupOverlay appBlurTargetRef={appBlurTargetRef} />

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
          <CheckCircle2 size={16} color={colors.signal} />
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
      zIndex: 140,
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

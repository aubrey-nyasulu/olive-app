import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useOlive } from "../context/OliveProvider";
import { colors } from "../constants/colors";

export const getHeaderHeight = (insetsTop: number) =>
  insetsTop + (Platform.OS === "android" ? 54 : 50);

export function IconButton({
  name,
  label,
  onPress,
  color,
  size = 20,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.pressedIcon,
      ]}
    >
      <Ionicons name={name} size={size} color={color || colors.text} />
    </Pressable>
  );
}

export function Screen({
  title,
  home,
  back,
  actions,
  children,
  staticContent,
}: {
  title?: string;
  home?: boolean;
  back?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  staticContent?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const {
    config,
    closeSearch,
    searchOpen,
    activeMode,
    feedMode,
    expandedWindow,
    openExpandedWindow,
    closeExpandedWindow,
  } = useOlive();

  const panelOpen = activeMode !== null;
  const dimmed = searchOpen || panelOpen;
  const headerHeight = getHeaderHeight(insets.top);

  const headerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: dimmed ? 0.4 : 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [dimmed, headerOpacity]);

  const handleBack = () => {
    closeSearch();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const showHeader = home || back || title;

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* Fixed Frosted Glassmorphism Header */}
        {showHeader && (
          <Animated.View
            pointerEvents={dimmed ? "none" : "auto"}
            style={[
              styles.fixedHeader,
              {
                height: headerHeight,
                paddingTop: insets.top,
                opacity: headerOpacity,
              },
            ]}
          >
            {/* Native / Web Blur Backdrop */}
            <BlurView
              intensity={Platform.OS === "ios" ? 65 : 85}
              tint={config.dark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />

            {/* 85% Warm Paper Background Tint Layer */}
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.glassTintOverlay,
                config.dark ? styles.glassTintDark : styles.glassTintLight,
              ]}
            />

            {/* Glass-Hairline: Linear gradient with warm signal tint in center */}
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[
                "transparent",
                colors.line,
                config.dark ? "#50372A" : "#E6CDBA",
                colors.line,
                "transparent",
              ]}
              locations={[0, 0.16, 0.5, 0.84, 1.0]}
              style={styles.glassHairline}
              pointerEvents="none"
            />

            {/* Header Content Row */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                {back && (
                  <IconButton
                    name="arrow-back"
                    label="Back"
                    onPress={handleBack}
                  />
                )}
                {home ? (
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Olive home"
                    onPress={() => {
                      closeSearch();
                      router.navigate("/");
                    }}
                  >
                    <Text style={styles.logoText}>
                      olive<Text style={styles.logoDot}>.</Text>
                    </Text>
                  </Pressable>
                ) : title ? (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.title,
                      back && styles.titleWithBack,
                    ]}
                  >
                    {title}
                  </Text>
                ) : null}
              </View>

              <View style={styles.headerRight}>
                {actions}
                {home && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Filter feed content"
                    onPress={() => {
                      closeSearch();
                      if (expandedWindow?.type === "feed_modes") {
                        closeExpandedWindow();
                      } else {
                        openExpandedWindow({ type: "feed_modes" });
                      }
                    }}
                    style={({ pressed }) => [
                      styles.filterButton,
                      feedMode !== "all"
                        ? styles.filterButtonActive
                        : styles.filterButtonDefault,
                      pressed && styles.pressedIcon,
                    ]}
                  >
                    <Ionicons
                      name={
                        feedMode === "people"
                          ? "people"
                          : feedMode === "places"
                          ? "business"
                          : "options-outline"
                      }
                      size={18}
                      color={feedMode !== "all" ? colors.signal : colors.text}
                    />
                    {feedMode !== "all" && <View style={styles.filterDot} />}
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Content View: Scrollable lists scroll behind the fixed frosted header */}
        <View
          style={[
            styles.content,
            staticContent && { paddingTop: headerHeight },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    position: "relative",
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    overflow: "hidden",
  },
  glassTintOverlay: {
    ...(Platform.OS === "web"
      ? ({
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        } as any)
      : {}),
  },
  glassTintLight: {
    backgroundColor: "rgba(250, 248, 245, 0.85)",
  },
  glassTintDark: {
    backgroundColor: "rgba(20, 19, 18, 0.85)",
  },
  glassHairline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },
  headerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 24,
    color: colors.text,
  },
  logoDot: {
    color: colors.signal,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.text,
  },
  titleWithBack: {
    fontSize: 17,
    fontWeight: "600",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  pressedIcon: {
    opacity: 0.65,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterButtonDefault: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  filterButtonActive: {
    backgroundColor: colors.signalLight,
    borderColor: colors.signal,
  },
  filterDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.signal,
  },
  content: {
    flex: 1,
  },
});

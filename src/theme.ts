import { useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  lightColors,
  darkColors,
  getPalette,
  type ColorPalette,
} from "./constants/colors";
import { useOlive } from "./context/OliveProvider";

export * from "./constants/colors";
export * from "./constants/grid";

export const palette = getPalette;

/**
 * Returns current dynamic theme colors and dark mode flag based on user settings.
 */
export function useTheme(): { colors: ColorPalette; isDark: boolean } {
  try {
    const { colors, isDark } = useOlive();
    return { colors, isDark };
  } catch {
    return { colors: lightColors, isDark: false };
  }
}

/**
 * Returns current dynamic colors.
 */
export function useColors(): ColorPalette {
  return useTheme().colors;
}

/**
 * Hook to generate and memoize StyleSheet styles that automatically update when theme changes.
 * Avoids inline styles on JSX while keeping all styles inside StyleSheet.create.
 */
export function useThemeStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>
>(
  factory: (colors: ColorPalette) => T
): { styles: T; colors: ColorPalette; isDark: boolean } {
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => {
    return StyleSheet.create(factory(colors));
  }, [colors]);

  return { styles, colors, isDark };
}

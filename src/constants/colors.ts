export const lightColors = {
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceMuted: "#F3EFE9",
  card: "#FFFFFF",
  text: "#22201D",
  textSecondary: "#4E4B45",
  muted: "#827C72",
  line: "#E6E0D6",
  signal: "#E8590C",
  signalLight: "#FFEDE4",
  signalForeground: "#FFFFFF",
  badgeBg: "rgba(255, 255, 255, 0.92)",
  badgeText: "#22201D",
  overlay: "rgba(0, 0, 0, 0.45)",
  error: "#D93829",
  actionPillBg: "rgba(230, 205, 186, 0.31)",
  actionPillBorder: "#E6CDBA",
  repostStripe: "rgba(0, 0, 0, 0.12)",
  mapGround: "#F3EFE9",
  mapRoad: "#FFFFFF",
  mapWater: "#E1EDF2",
} as const;

export const darkColors = {
  bg: "#141312",
  surface: "#1D1C1A",
  surfaceMuted: "#262421",
  card: "#211F1C",
  text: "#F6F3EC",
  textSecondary: "#C9C4B9",
  muted: "#8F897E",
  line: "#33302B",
  signal: "#FF6326",
  signalLight: "#3D2417",
  signalForeground: "#FFFFFF",
  badgeBg: "rgba(22, 21, 20, 0.85)",
  badgeText: "#F6F3EC",
  overlay: "rgba(0, 0, 0, 0.75)",
  error: "#FF6B6B",
  actionPillBg: "rgba(230, 205, 186, 0.14)",
  actionPillBorder: "rgba(230, 205, 186, 0.38)",
  repostStripe: "rgba(255, 255, 255, 0.14)",
  mapGround: "#1C1B19",
  mapRoad: "#2A2825",
  mapWater: "#182229",
} as const;

export type ColorPalette = Record<keyof typeof lightColors, string>;
export type Colors = ColorPalette;

// Default canonical colors export for direct access without React context
export const colors = lightColors;
export default colors;

export const getPalette = (dark: boolean): ColorPalette =>
  dark ? darkColors : lightColors;

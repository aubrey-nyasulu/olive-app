export const palette = (dark: boolean) =>
  dark
    ? {
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
        mapGround: "#1C1B19",
        mapRoad: "#2A2825",
        mapWater: "#182229",
      }
    : {
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
        mapGround: "#F3EFE9",
        mapRoad: "#FFFFFF",
        mapWater: "#E1EDF2",
      };

export type Colors = ReturnType<typeof palette>;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

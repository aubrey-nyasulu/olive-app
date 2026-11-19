import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { OliveProvider, useOlive } from "../context/OliveProvider";
import { colors, darkColors } from "../constants/colors";

function Navigation() {
  const { config } = useOlive();
  const baseTheme = config.dark ? DarkTheme : DefaultTheme;
  const currentColors = config.dark ? darkColors : colors;

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: currentColors.bg,
          card: currentColors.card,
          text: currentColors.text,
          border: currentColors.line,
          primary: currentColors.signal,
        },
      }}
    >
      <StatusBar style={config.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: currentColors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="p/[id]" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OliveProvider>
        <Navigation />
      </OliveProvider>
    </SafeAreaProvider>
  );
}
import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { OliveProvider, useOlive } from "../context/OliveProvider";

function Navigation() {
  const { config, colors: currentColors, isDark } = useOlive();
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

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
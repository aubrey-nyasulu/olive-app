import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { OliveProvider, useOlive } from "../context/OliveProvider";

function Navigation() {
  const { config, colors } = useOlive();
  const baseTheme = config.dark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: colors.bg,
          card: colors.card,
          text: colors.text,
          border: colors.line,
          primary: colors.signal,
        },
      }}
    >
      <StatusBar style={config.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
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

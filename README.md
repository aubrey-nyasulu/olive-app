# Olive (React Native / Expo SDK 57)

Transformed from the Lovable web project into an idiomatic React Native project using standard React Native styling (no Tailwind) and structured according to your preferred project architecture.

---

## 📁 Project Structure

```
olive-app/
├── app/                                 # Expo Router routes (thin delegators)
│   ├── _layout.tsx                     # Re-exports RootLayout from src/layout/RootLayout
│   ├── index.tsx                       # Re-exports FeedScreen from src/screens/FeedScreen
│   ├── profile.tsx                     # Re-exports ProfileScreen from src/screens/ProfileScreen
│   └── p/
│       └── [id].tsx                    # Re-exports PlaceDetailScreen from src/screens/PlaceDetailScreen
│
├── assets/
│   ├── images/                         # Bundled local images (places & profile avatar)
│   ├── icon.png                        # App icon
│   └── adaptive-icon.png               # Android adaptive icon
│
├── src/
│   ├── components/                     # Reusable UI components (StyleSheet-styled)
│   │   ├── Screen.tsx                  # Safe-area screen shell with header & Olive branding
│   │   ├── AppShell.tsx                # Floating bottom search dock (Voice/Type/Visual modes)
│   │   ├── PostCard.tsx                # Feed card with Details/Reviews/Related bottom modal
│   │   ├── PlaceMap.tsx                # Rethought in-app map with radar pulse & coordinates
│   │   ├── GuidanceModal.tsx           # Full in-app turn-by-turn guidance experience
│   │   ├── SearchModes.tsx             # Type search, Voice waves, and Visual search finder
│   │   └── Pill.tsx                    # Reusable filter/setting pills
│   │
│   ├── context/
│   │   └── OliveProvider.tsx           # App state: theme colors, settings, saved places, search, in-app guidance
│   │
│   ├── layout/
│   │   └── RootLayout.tsx              # SafeAreaProvider, OliveProvider, Stack Navigation & Theme
│   │
│   ├── screens/
│   │   ├── FeedScreen.tsx              # Main feed with radius & category filtering
│   │   ├── PlaceDetailScreen.tsx       # Venue details, map, and "Guide me there" action
│   │   └── ProfileScreen.tsx           # Saved places list & settings (radius, lanes, mode, alerts, dark theme)
│   │
│   ├── models.ts                       # TypeScript interfaces (Post, Review, GuidanceStep, SettingsState)
│   ├── storage.ts                      # AsyncStorage persistence for user preferences & bookmarks
│   ├── theme.ts                        # Editorial warm paper color palette & design tokens (light & dark)
│   └── places.ts                       # Places dataset, reviews, ETA calculation, and route generation
│
├── app.json                            # Expo configuration
├── package.json                        # Dependencies & scripts (SDK 57)
└── tsconfig.json                       # TypeScript config with "@/..." path alias
```

---

## 🎨 Design & Styling

- **Zero Tailwind**: Styled entirely using native `StyleSheet.create({ ... })`.
- **Editorial Momentum Palette**: Ported directly from Olive's web design system:
  - Warm paper ground (`#FAF8F5`) and near-black ink text (`#22201D`).
  - Signature signal color (`#E8590C` / `#FF6326`) for action momentum and pulses.
  - Built-in Dark Mode support toggled from Profile Settings.

---

## 🧭 In-App Guidance (No External App Redirect)

- Tapping **"Guide me there"** opens an in-app guidance dashboard.
- Estimates travel time based on your chosen transport mode in Settings (**Walking**, **Cycling**, or **Driving**).
- Displays remaining distance, step-by-step navigation instructions with direction icons, landmarks, and route progress.
- Includes an in-app visual radar map highlighting the destination.

---

## 🚀 How to Run

1. Navigate to the project directory:
   ```bash
   cd olive-app
   ```

2. Start the Expo development server with cache reset:
   ```bash
   npx expo start -c
   ```

3. **To test on Phone (Expo Go)**:
   - Scan the QR code shown in your terminal with the Expo Go app.
   - Fully compatible with the Expo Go client.

4. **To test on Web**:
   - Press `w` in the terminal or open `http://localhost:8081` in your browser.

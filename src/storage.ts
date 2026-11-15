import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SettingsState } from "./models";

export const CATEGORIES = ["Fuel", "Concert", "Bakery", "Market", "Pharmacy", "Dining"];

export const DEFAULT_SETTINGS: SettingsState = {
  radiusKm: 3,
  lanes: CATEGORIES,
  mode: "walking",
  alerts: true,
  dark: false,
};

export const DEFAULT_SAVED_IDS = [
  "forno",
  "park-live",
  "saturday-market",
  "chambo-grill",
];

const SETTINGS_KEY = "olive:settings";
const SAVED_IDS_KEY = "olive:saved_ids";

export async function loadSettings(): Promise<SettingsState> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    console.warn("Failed to load Olive settings", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: SettingsState): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save Olive settings", error);
  }
}

export async function loadSavedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_IDS_KEY);
    if (!raw) return DEFAULT_SAVED_IDS;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to load Olive saved ids", error);
    return DEFAULT_SAVED_IDS;
  }
}

export async function saveSavedIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVED_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn("Failed to save Olive saved ids", error);
  }
}

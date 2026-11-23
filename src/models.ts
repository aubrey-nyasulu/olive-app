import type { ImageSourcePropType } from "react-native";
import type { LucideIcon } from "lucide-react-native";

export type PostKind = "Business" | "Event" | "Person";

export type Post = {
  id: string;
  author: string;
  kind: PostKind;
  category: string;
  title: string;
  body: string;
  place: string;
  lat: number;
  lng: number;
  distanceKm: number;
  when: string;
  image: ImageSourcePropType;
  ratio?: "1/1" | "4/3" | "4/5";
};

export type Review = {
  by: string;
  stars: number;
  text: string;
};

export type ReactionType = "heart" | "flower" | "like" | "laugh" | "fire" | "clap";

export type PostReactions = Record<ReactionType, number>;

export type SearchMode = "type" | "voice" | "visual";

export type TravelMode = "walking" | "cycling" | "driving";

export type SettingsState = {
  radiusKm: number;
  lanes: string[];
  mode: TravelMode;
  alerts: boolean;
  dark: boolean;
};

export type GuidanceStep = {
  id: string;
  instruction: string;
  distance: string;
  iconName: LucideIcon;
  landmark: string;
};

export type GuidanceSession = {
  post: Post;
  mode: TravelMode;
  etaMinutes: number;
  distanceRemainingKm: number;
  steps: GuidanceStep[];
  currentStepIndex: number;
};

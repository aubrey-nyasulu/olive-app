import type { ImageSourcePropType } from "react-native";

const avatarChisomo = require("../assets/images/profile-avatar.jpg");
const bakery = require("../assets/images/place-bakery.jpg");
const concert = require("../assets/images/place-concert.jpg");
const market = require("../assets/images/place-market.jpg");
const fuel = require("../assets/images/place-fuel.jpg");
const pharmacy = require("../assets/images/place-pharmacy.jpg");
const chambo = require("../assets/images/place-chambo.jpg");
const coffee = require("../assets/images/place-coffee.jpg");
const nature = require("../assets/images/place-nature.jpg");

export type StoryItem = {
  id: string;
  authorId: string;
  authorName: string;
  displayName: string;
  authorHandle: string;
  avatar: ImageSourcePropType;
  storyImage: ImageSourcePropType;
  title: string;
  caption: string;
  location: string;
  timeAgo: string;
  isOwner?: boolean;
  hasUnread?: boolean;
  badge?: "LIVE" | "HOT" | "NEW";
  targetPostId?: string;
};

export const STORIES: StoryItem[] = [
  {
    id: "chisomo-status",
    authorId: "chisomo",
    authorName: "Chisomo Banda",
    displayName: "Your Story",
    authorHandle: "@chisomo",
    avatar: avatarChisomo,
    storyImage: nature,
    title: "Morning cycle & quiet thoughts 🚲",
    caption:
      "Morning ride down Presidential Way toward the Lingadzi nature trail. Air is crisp, Jacaranda petals scattering on the avenue.",
    location: "Presidential Way, Area 10",
    timeAgo: "Just now",
    isOwner: true,
    hasUnread: false,
    targetPostId: "chisomo-bakery",
  },
  {
    id: "story-mabu",
    authorId: "forno",
    authorName: "Mabu Artisan Bakes",
    displayName: "Mabu Bakes",
    authorHandle: "@mabubakes",
    avatar: bakery,
    storyImage: bakery,
    title: "Sourdough batch just pulled! 🥖",
    caption:
      "Warm cardamom buns and rustic sourdough loaves straight from our wood-fired brick oven. Brewing fresh Misuku Hills pour-overs until 18:00.",
    location: "14 Presidential Way, Area 10",
    timeAgo: "1h ago",
    hasUnread: true,
    badge: "HOT",
    targetPostId: "forno",
  },
  {
    id: "story-lingadzi",
    authorId: "park-live",
    authorName: "Lingadzi Sessions",
    displayName: "Lingadzi",
    authorHandle: "@lingadzisessions",
    avatar: concert,
    storyImage: concert,
    title: "Soundcheck under the acacia trees 🎸",
    caption:
      "Fairy lights are strung up under the indigenous forest canopy! Acoustic strings & kalimba soundcheck in progress. Gates open at 18:30 tonight.",
    location: "Lilongwe Wildlife Sanctuary",
    timeAgo: "2h ago",
    hasUnread: true,
    badge: "LIVE",
    targetPostId: "park-live",
  },
  {
    id: "story-tamanda",
    authorId: "saturday-market",
    authorName: "Tamanda Gondwe",
    displayName: "Tamanda",
    authorHandle: "@tamandagondwe",
    avatar: market,
    storyImage: market,
    title: "Four Seasons market is open 🥭",
    caption:
      "Dedza raw mountain honey jars just stocked next to sweet Salima mangoes and handwoven cane baskets. Come through Four Seasons gardens!",
    location: "Four Seasons Gardens, Area 12",
    timeAgo: "3h ago",
    hasUnread: true,
    targetPostId: "saturday-market",
  },
  {
    id: "story-kachere",
    authorId: "chambo-grill",
    authorName: "Kachere Chambo & Braai",
    displayName: "Kachere Braai",
    authorHandle: "@kacherebraai",
    avatar: chambo,
    storyImage: chambo,
    title: "Lake Chambo sizzling on charcoal 🔥",
    caption:
      "Morning catch delivered fresh from Sengabay! Whole Lake Malawi Chambo slow-grilled with herb butter and freshly diced spicy kachumbari relish.",
    location: "Gateway Mall Terrace, Area 47",
    timeAgo: "4h ago",
    hasUnread: true,
    badge: "NEW",
    targetPostId: "chambo-grill",
  },
  {
    id: "story-puma",
    authorId: "harbour-fuel",
    authorName: "Puma Energy",
    displayName: "Puma Energy",
    authorHandle: "@pumaenergy",
    avatar: fuel,
    storyImage: fuel,
    title: "All bays clear & Quick-Shop open ⛽",
    caption:
      "Zero queue on diesel and petrol bays. Power backup active, automated wash bay open, and barista coffee ready at our 24hr Quick-Shop.",
    location: "Kenyatta Drive, Area 3",
    timeAgo: "5h ago",
    hasUnread: true,
    targetPostId: "harbour-fuel",
  },
  {
    id: "story-bwaila",
    authorId: "pharmacy",
    authorName: "Bwaila Community Pharmacy",
    displayName: "Bwaila Pharm",
    authorHandle: "@bwailapharmacy",
    avatar: pharmacy,
    storyImage: pharmacy,
    title: "On-duty dispensary tonight 💊",
    caption:
      "Licensed clinical pharmacists on emergency night shift until midnight. Prescription fulfillment and rapid malaria diagnostic checks open.",
    location: "Kamuzu Procession Rd, Area 2",
    timeAgo: "6h ago",
    hasUnread: false,
    targetPostId: "pharmacy",
  },
  {
    id: "story-kondwani",
    authorId: "kondwani-coffee",
    authorName: "Kondwani Banda",
    displayName: "Kondwani",
    authorHandle: "@kondwanibanda",
    avatar: coffee,
    storyImage: coffee,
    title: "Misuku Hills brew of the day ☕",
    caption:
      "Single-origin pour-over paired with warm cinnamon buns after an Area 43 morning cycling lap.",
    location: "Area 43 Gardens",
    timeAgo: "7h ago",
    hasUnread: true,
    targetPostId: "kondwani-coffee",
  },
  {
    id: "story-dalitso",
    authorId: "dalitso-photo",
    authorName: "Dalitso Phiri",
    displayName: "Dalitso",
    authorHandle: "@dalitsophiri",
    avatar: nature,
    storyImage: nature,
    title: "Golden hour turaco sighting 🌿",
    caption:
      "Purple-crested turacos perched along the sanctuary nature trail right before sunset.",
    location: "Lilongwe Wildlife Sanctuary",
    timeAgo: "8h ago",
    hasUnread: true,
    targetPostId: "dalitso-photo",
  },
];

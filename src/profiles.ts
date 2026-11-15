import type { ImageSourcePropType } from "react-native";
import { POSTS } from "./places";
import type { Post } from "./models";

const avatarAmara = require("../assets/images/profile-avatar.jpg");
const coverAmara = require("../assets/images/profile-cover.jpg");
const fuel = require("../assets/images/place-fuel.jpg");
const concert = require("../assets/images/place-concert.jpg");
const bakery = require("../assets/images/place-bakery.jpg");
const market = require("../assets/images/place-market.jpg");
const pharmacy = require("../assets/images/place-pharmacy.jpg");
const evCharge = require("../assets/images/place-ev-charge.jpg");

export type ProfileKind = "Person" | "Business" | "Event";

export type ProfileInfo = {
  headline: string;
  about: string;
  hoursOrSchedule: string;
  location: string;
  phone?: string;
  website?: string;
  social?: string;
  memberSince?: string;
  badges: string[];
  calendarHabits: string;
};

export type UserProfile = {
  id: string;
  name: string;
  handle: string;
  kind: ProfileKind;
  category: string;
  neighborhood: string;
  avatar: ImageSourcePropType;
  cover: ImageSourcePropType;
  bio: string;
  stats: {
    postsCount: number;
    statA: { label: string; value: string | number };
    statB: { label: string; value: string | number };
    statC: { label: string; value: string | number };
  };
  info: ProfileInfo;
  posts: Post[];
};

export const PROFILES: Record<string, UserProfile> = {
  amara: {
    id: "amara",
    name: "Amara Boateng",
    handle: "@amara",
    kind: "Person",
    category: "Local Guide & Curator",
    neighborhood: "Campo de Ourique, Lisboa",
    avatar: avatarAmara,
    cover: coverAmara,
    bio: "Exploring Lisbon's quiet corners, artisanal bakeries, and open-air acoustic sets. Morning cyclist & neighborhood archivist.",
    stats: {
      postsCount: 3,
      statA: { label: "Saved", value: 4 },
      statB: { label: "Following", value: 142 },
      statC: { label: "Followers", value: 318 },
    },
    info: {
      headline: "Hyperlocal Curator & Morning Cyclist",
      about:
        "Passionate about neighborhood mobility, independent bakeries, and sunset live sets across Lisbon's public parks. I track morning sourdough batches and free outdoor acoustic concerts in Estrela and Campo de Ourique.",
      hoursOrSchedule: "Active weekday mornings (07:30–10:00) & weekend afternoons",
      location: "Campo de Ourique, 1350-001 Lisboa",
      memberSince: "Member since March 2024",
      badges: [
        "Verified Guide",
        "Early Riser",
        "Estrela Local",
        "Acoustic Enthusiast",
      ],
      calendarHabits:
        "Shares fresh bakery batches, weekly flea markets, and live park session reminders.",
      social: "@amara_lisboa",
    },
    posts: [
      POSTS[6], // amara-campo-bakery
      POSTS[7], // amara-estrela-sunset
      POSTS[8], // amara-market-finds
    ],
  },

  forno: {
    id: "forno",
    name: "Forno Lento",
    handle: "@fornolento",
    kind: "Business",
    category: "Artisanal Wood-Fired Bakery",
    neighborhood: "Estrela, Lisboa",
    avatar: bakery,
    cover: bakery,
    bio: "Artisanal wood-fired bakery in Estrela. Natural sourdough loaves and warm almond croissants baked fresh twice daily with organic local flour.",
    stats: {
      postsCount: 2,
      statA: { label: "Rating", value: "4.9 ★" },
      statB: { label: "Batches", value: "2 / day" },
      statC: { label: "Followers", value: "1.2k" },
    },
    info: {
      headline: "Wood-Fired Bakery & Specialty Coffee",
      about:
        "Every loaf is naturally fermented for 28 hours and baked in our custom wood-fired oven using ancient grain flours sourced from the Alentejo. Come early for warm croissants or stop by for afternoon baguettes.",
      hoursOrSchedule: "Tue – Sun: 07:30 – 19:00 (Mon closed)",
      location: "R. da Esperança 41, 1200-655 Lisboa",
      phone: "+351 21 892 4110",
      website: "fornolento.pt",
      social: "@fornolento_lisboa",
      memberSince: "Partner since Jan 2023",
      badges: [
        "Organic Flour",
        "Wood Fired Oven",
        "Outdoor Benches",
        "Cards Accepted",
        "Dog Friendly",
      ],
      calendarHabits:
        "Batch 1: 08:00 (Sourdough & warm croissants)\nBatch 2: 14:00 (Rustic baguettes & cinnamon buns)",
    },
    posts: [
      POSTS[2],
      {
        ...POSTS[2],
        id: "forno-afternoon",
        title: "Afternoon country loaves ready",
        when: "Fresh batch · 14:00",
      },
    ],
  },

  "park-live": {
    id: "park-live",
    name: "Jardim Sessions",
    handle: "@jardimsessions",
    kind: "Event",
    category: "Live Music Collective",
    neighborhood: "Jardim da Estrela, Lisboa",
    avatar: concert,
    cover: concert,
    bio: "Sunset acoustic sessions and open-air live music across Lisbon's botanical gardens and public parks. Free entry, acoustic & indie folk.",
    stats: {
      postsCount: 2,
      statA: { label: "Events", value: 28 },
      statB: { label: "Rating", value: "5.0 ★" },
      statC: { label: "Followers", value: "2.8k" },
    },
    info: {
      headline: "Open-Air Music & Cultural Gatherings",
      about:
        "We curate independent musicians and intimate acoustic acts in Lisbon's heritage parks. Bring picnic blankets, wine, and friends. Low decibel, community-focused, and family friendly.",
      hoursOrSchedule: "Bi-weekly Fri & Sat: 19:00 – 23:00 (Live sets start at 21:00)",
      location: "Jardim da Estrela, 1200-667 Lisboa",
      website: "jardimsessions.org",
      social: "@jardimsessions",
      memberSince: "Host since June 2023",
      badges: [
        "Free Entry",
        "All Ages",
        "Food Trucks",
        "Picnic Friendly",
        "Acoustic Only",
      ],
      calendarHabits:
        "Bi-weekly weekend evening acoustic sets from April through October.",
    },
    posts: [
      POSTS[1],
      {
        ...POSTS[1],
        id: "park-live-next",
        title: "Sunday Sunset Jazz Trio",
        when: "Sunday · 18:30",
      },
    ],
  },

  "saturday-market": {
    id: "saturday-market",
    name: "Marta Reis",
    handle: "@martareis",
    kind: "Person",
    category: "Market Host & Botanical Artist",
    neighborhood: "Praça das Flores, Lisboa",
    avatar: market,
    cover: market,
    bio: "Hosting Saturday flea markets, craft tables, and bike fix-it corners in Praça das Flores. Passionate about urban gardening and zero waste living.",
    stats: {
      postsCount: 2,
      statA: { label: "Drops", value: 16 },
      statB: { label: "Trust", value: "99%" },
      statC: { label: "Followers", value: 420 },
    },
    info: {
      headline: "Community Organizer & Botanical Illustrator",
      about:
        "Living around Praça das Flores for 8 years. I organize our Saturday morning market connecting local Alentejo organic growers, handmade soap crafters, and a friendly community bike tool corner.",
      hoursOrSchedule: "Every Saturday: 08:00 – 14:00",
      location: "Praça das Flores, 1200-192 Lisboa",
      social: "@marta_ilustra",
      memberSince: "Member since Sept 2023",
      badges: [
        "Community Host",
        "Zero Waste",
        "Bike Fix-It",
        "Dog Friendly",
      ],
      calendarHabits:
        "Saturday morning fresh farm produce drops and monthly botanical plant swaps.",
    },
    posts: [
      POSTS[3],
      {
        ...POSTS[3],
        id: "market-plants",
        title: "Neighborhood Plant & Cutting Swap",
        when: "Next Sat · 11:00",
      },
    ],
  },

  "harbour-fuel": {
    id: "harbour-fuel",
    name: "Harbour Fuel",
    handle: "@harbourfuel",
    kind: "Business",
    category: "24/7 Station & Waterfront Stop",
    neighborhood: "Av. Brasília, Lisboa",
    avatar: fuel,
    cover: fuel,
    bio: "24/7 service station with fuel, air, vacuum, soft-touch automated wash, and fresh Delta barista coffee along the riverfront highway.",
    stats: {
      postsCount: 1,
      statA: { label: "Rating", value: "4.6 ★" },
      statB: { label: "Status", value: "24 / 7" },
      statC: { label: "Reviews", value: 112 },
    },
    info: {
      headline: "Full-Service Waterfront Station & Mart",
      about:
        "Conveniently located along the Tagus riverfront just off the bridge bypass. 24/7 fueling bays, soft-cloth express wash, fresh bakery pastries, and convenience essentials.",
      hoursOrSchedule: "Open 24 hours, 7 days a week",
      location: "Av. Brasília 12, 1300-598 Lisboa",
      phone: "+351 21 390 1200",
      badges: [
        "Open 24/7",
        "Car Wash",
        "Air & Water",
        "Espresso Bar",
        "Contactless",
      ],
      calendarHabits:
        "Real-time morning diesel/petrol price adjustments and express wash bay queue alerts.",
    },
    posts: [POSTS[0]],
  },

  pharmacy: {
    id: "pharmacy",
    name: "Farmácia Central",
    handle: "@farmaciacentral",
    kind: "Business",
    category: "On-Duty Community Pharmacy",
    neighborhood: "Calçada do Combro, Lisboa",
    avatar: pharmacy,
    cover: pharmacy,
    bio: "Neighborhood dispensary with late-night on-duty shifts, prescription fulfillment, natural cosmetics, and healthcare consultation.",
    stats: {
      postsCount: 1,
      statA: { label: "Rating", value: "4.7 ★" },
      statB: { label: "Shift", value: "On-Duty" },
      statC: { label: "Reviews", value: 48 },
    },
    info: {
      headline: "Trusted Community Pharmacy Since 1928",
      about:
        "Serving the Santa Catarina and Bica quarters for generations. Dedicated night service window, blood pressure monitoring, traveler medical consultation, and multi-lingual staff.",
      hoursOrSchedule: "Mon – Sat: 08:30 – 00:00 (On-duty rotation nights)",
      location: "Calçada do Combro 8, 1200-114 Lisboa",
      phone: "+351 21 342 5678",
      badges: [
        "Late Night On-Duty",
        "English Spoken",
        "Blood Pressure Check",
        "Wheelchair Access",
      ],
      calendarHabits:
        "Official late-night on-duty emergency shifts and seasonal vaccine availability.",
    },
    posts: [POSTS[4]],
  },

  "ev-charge": {
    id: "ev-charge",
    name: "VoltPoint",
    handle: "@voltpoint",
    kind: "Business",
    category: "Ultra-Fast EV Charging Hub",
    neighborhood: "LxFactory / Alcântara, Lisboa",
    avatar: evCharge,
    cover: evCharge,
    bio: "150 kW CCS fast chargers powered by 100% renewable energy. Covered bays with high-speed Wi-Fi and artisan bakery adjacent.",
    stats: {
      postsCount: 1,
      statA: { label: "Chargers", value: "4 / 4" },
      statB: { label: "Speed", value: "150 kW" },
      statC: { label: "Green", value: "100%" },
    },
    info: {
      headline: "100% Renewable Ultra-Fast Charging Station",
      about:
        "Clean energy mobility hub next to LxFactory. Features 4x 150 kW DC fast chargers with CCS2 and CHAdeMO connectors. Automated app-free contactless payment.",
      hoursOrSchedule: "Open 24 hours, 7 days a week",
      location: "R. Rodrigues Faria 103, 1300-501 Lisboa",
      phone: "+351 21 800 9000",
      website: "voltpoint.energy",
      badges: [
        "150 kW Fast Charge",
        "100% Green Energy",
        "Covered Canopy",
        "Contactless",
        "Free Wi-Fi",
      ],
      calendarHabits:
        "Live charger occupancy updates and off-peak green charging discounts.",
    },
    posts: [POSTS[5]],
  },
};

export function getProfile(query?: string | null): UserProfile {
  if (!query) return PROFILES.amara;

  const normalized = query.toLowerCase().trim();

  // 1. Direct key match
  if (PROFILES[normalized]) return PROFILES[normalized];

  // 2. Match by name or handle or post ID
  for (const prof of Object.values(PROFILES)) {
    if (
      prof.id.toLowerCase() === normalized ||
      prof.name.toLowerCase() === normalized ||
      prof.handle.toLowerCase() === normalized ||
      prof.handle.toLowerCase() === `@${normalized}`
    ) {
      return prof;
    }
  }

  // 3. Fallback: match by post ID or author inside POSTS
  const matchedPost = POSTS.find(
    (p) =>
      p.id.toLowerCase() === normalized ||
      p.author.toLowerCase() === normalized
  );

  if (matchedPost) {
    if (PROFILES[matchedPost.id]) return PROFILES[matchedPost.id];
    for (const prof of Object.values(PROFILES)) {
      if (prof.name.toLowerCase() === matchedPost.author.toLowerCase()) {
        return prof;
      }
    }
  }

  return PROFILES.amara;
}

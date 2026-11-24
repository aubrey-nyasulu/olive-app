import type { ImageSourcePropType } from "react-native";
import { POSTS } from "./places";
import type { Post } from "../models";

const avatarChisomo = require("../../assets/images/profile-avatar.jpg");
const coverChisomo = require("../../assets/images/profile-cover.jpg");
const fuel = require("../../assets/images/place-fuel.jpg");
const concert = require("../../assets/images/place-concert.jpg");
const bakery = require("../../assets/images/place-bakery.jpg");
const market = require("../../assets/images/place-market.jpg");
const pharmacy = require("../../assets/images/place-pharmacy.jpg");
const chambo = require("../../assets/images/place-chambo.jpg");
const coffee = require("../../assets/images/place-coffee.jpg");
const nature = require("../../assets/images/place-nature.jpg");

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
    followers: string | number;
    following: string | number;
    rating: number;
    reviewsCount: number;
    statA: { label: string; value: string | number };
    statB: { label: string; value: string | number };
    statC: { label: string; value: string | number };
  };
  info: ProfileInfo;
  posts: Post[];
};

export const PROFILES: Record<string, UserProfile> = {
  chisomo: {
    id: "chisomo",
    name: "Chisomo Banda",
    handle: "@chisomo",
    kind: "Person",
    category: "Local Guide & Cultural Curator",
    neighborhood: "Area 10 & Old Town",
    avatar: avatarChisomo,
    cover: coverChisomo,
    bio: "Exploring quiet shaded lanes, artisanal coffee roasters, and live acoustic sessions by the park. Cyclist & neighborhood archivist.",
    stats: {
      postsCount: 3,
      followers: 412,
      following: 168,
      rating: 4.9,
      reviewsCount: 38,
      statA: { label: "Saved", value: 6 },
      statB: { label: "Following", value: 168 },
      statC: { label: "Followers", value: 412 },
    },
    info: {
      headline: "Neighborhood Explorer & Morning Cyclist",
      about:
        "Passionate about neighborhood mobility, independent bakeries, and open-air acoustic sets. Tracking fresh morning sourdough batches in Area 10, acoustic sessions along the park trails, and organic produce drops in Old Town.",
      hoursOrSchedule: "Active weekday mornings (07:00–09:30) & weekend afternoons",
      location: "Presidential Way, Area 10",
      memberSince: "Member since January 2024",
      badges: [
        "Verified Guide",
        "Early Riser",
        "Area 10 Local",
        "Acoustic Enthusiast",
      ],
      calendarHabits:
        "Shares fresh bakery batches, weekly farmer produce drops, and live acoustic session reminders.",
      social: "@chisomo_b",
    },
    posts: [
      POSTS[6], // chisomo-bakery
      POSTS[7], // chisomo-acoustic-set
      POSTS[8], // chisomo-market-finds
    ],
  },

  forno: {
    id: "forno",
    name: "Mabu Artisan Bakes",
    handle: "@mabubakes",
    kind: "Business",
    category: "Artisanal Wood-Fired Bakery & Café",
    neighborhood: "Area 10",
    avatar: bakery,
    cover: bakery,
    bio: "Artisanal bakery and specialty café in Area 10. Slow-fermented sourdough loaves, cardamom morning buns, and warm almond croissants baked fresh twice daily.",
    stats: {
      postsCount: 2,
      followers: "1.4k",
      following: 42,
      rating: 4.9,
      reviewsCount: 128,
      statA: { label: "Rating", value: "4.9 ★" },
      statB: { label: "Batches", value: "2 / day" },
      statC: { label: "Followers", value: "1.4k" },
    },
    info: {
      headline: "Wood-Fired Bakery & Specialty Coffee",
      about:
        "Every loaf is naturally fermented for 24 hours using stoneground flours and baked fresh in our brick oven. Pair our warm croissants with fresh single-origin pour-overs.",
      hoursOrSchedule: "Tue – Sun: 07:00 – 18:00 (Mon closed)",
      location: "14 Presidential Way, Area 10",
      phone: "+265 1 772 400",
      website: "mabubakes.com",
      social: "@mabubakes",
      memberSince: "Partner since Jan 2023",
      badges: [
        "Stoneground Flour",
        "Specialty Coffee",
        "Garden Seating",
        "Mobile Pay Accepted",
        "Pet Friendly",
      ],
      calendarHabits:
        "Batch 1: 07:30 (Sourdough & warm croissants)\nBatch 2: 13:30 (Country boules & rosemary focaccia)",
    },
    posts: [
      POSTS[2],
      {
        ...POSTS[2],
        id: "forno-afternoon",
        title: "Afternoon country boules ready",
        when: "Fresh batch · 13:30",
      },
    ],
  },

  "park-live": {
    id: "park-live",
    name: "Lingadzi Sessions",
    handle: "@lingadzisessions",
    kind: "Event",
    category: "Live Music & Arts Collective",
    neighborhood: "Wildlife Sanctuary Gardens",
    avatar: concert,
    cover: concert,
    bio: "Sunset acoustic sessions and open-air performances under the sanctuary forest canopy. Acoustic folk, soul, and indie strings. Free entry.",
    stats: {
      postsCount: 2,
      followers: "3.2k",
      following: 84,
      rating: 5.0,
      reviewsCount: 96,
      statA: { label: "Sessions", value: 32 },
      statB: { label: "Rating", value: "5.0 ★" },
      statC: { label: "Followers", value: "3.2k" },
    },
    info: {
      headline: "Open-Air Music & Cultural Gatherings",
      about:
        "We curate independent musicians and intimate acoustic performances beneath the trees. Bring picnic blankets, juices, and friends. Low decibel, family friendly.",
      hoursOrSchedule: "Bi-weekly Fri & Sat: 17:30 – 21:30 (Sets start at 18:30)",
      location: "Sanctuary Gardens, Kenyatta Drive",
      website: "lingadzisessions.org",
      social: "@lingadzisessions",
      memberSince: "Host since June 2023",
      badges: [
        "Free Entry",
        "All Ages",
        "Artisan Stalls",
        "Picnic Friendly",
        "Acoustic Only",
      ],
      calendarHabits:
        "Bi-weekly weekend acoustic sets along the sanctuary nature trail.",
    },
    posts: [
      POSTS[1],
      {
        ...POSTS[1],
        id: "park-live-next",
        title: "Sunday Sunset Kalimba & Guitar Trio",
        when: "Sunday · 18:00",
      },
    ],
  },

  "saturday-market": {
    id: "saturday-market",
    name: "Tamanda Gondwe",
    handle: "@tamandagondwe",
    kind: "Person",
    category: "Market Host & Botanical Herbalist",
    neighborhood: "Four Seasons, Area 12",
    avatar: market,
    cover: market,
    bio: "Hosting Saturday garden markets, botanical craft stalls, and seed-saving corners at Four Seasons. Passionate about agroecology and local food heritage.",
    stats: {
      postsCount: 2,
      followers: 580,
      following: 112,
      rating: 4.9,
      reviewsCount: 74,
      statA: { label: "Markets", value: 24 },
      statB: { label: "Trust", value: "100%" },
      statC: { label: "Followers", value: 580 },
    },
    info: {
      headline: "Market Coordinator & Botanical Herbalist",
      about:
        "Organizing the Saturday garden gathering for 5 years. Connecting organic vegetable growers, fruit farmers, natural beeswax crafters, and local herbal tea blenders in a relaxed atmosphere.",
      hoursOrSchedule: "Every Saturday: 08:00 – 14:00",
      location: "Four Seasons Gardens, Presidential Way, Area 12",
      social: "@tamanda_herbs",
      memberSince: "Member since Sept 2023",
      badges: [
        "Community Host",
        "Zero Chemical",
        "Seed Swap",
        "Dog Friendly",
      ],
      calendarHabits:
        "Saturday morning organic harvest drops and monthly botanical plant swaps.",
    },
    posts: [
      POSTS[3],
      {
        ...POSTS[3],
        id: "market-herbs",
        title: "Herb Seedling & Plant Swap",
        when: "Next Sat · 10:30",
      },
    ],
  },

  "harbour-fuel": {
    id: "harbour-fuel",
    name: "Puma Energy",
    handle: "@pumaenergy",
    kind: "Business",
    category: "24/7 Station & Quick-Shop",
    neighborhood: "Kenyatta Drive, Area 3",
    avatar: fuel,
    cover: fuel,
    bio: "24/7 service station with clean fuels, tyre service, automated wash, and a 24hr Quick-Shop for snacks and fresh barista coffee on Kenyatta Drive.",
    stats: {
      postsCount: 1,
      followers: 860,
      following: 18,
      rating: 4.8,
      reviewsCount: 142,
      statA: { label: "Rating", value: "4.8 ★" },
      statB: { label: "Status", value: "24 / 7" },
      statC: { label: "Reviews", value: 142 },
    },
    info: {
      headline: "Full-Service 24/7 Fuel Station & Quick-Shop",
      about:
        "Centrally positioned on Kenyatta Drive in Area 3. Clean fuel dispensers, high-pressure foam wash, 24hr Quick-Shop, ATM, and reliable power backup.",
      hoursOrSchedule: "Open 24 hours, 7 days a week",
      location: "Kenyatta Drive, Area 3",
      phone: "+265 1 754 110",
      badges: [
        "Open 24/7",
        "24hr Quick-Shop",
        "Express Wash",
        "Tyre Service",
        "Card & Mobile Pay",
      ],
      calendarHabits:
        "Fuel availability confirmations and peak morning rush wash bay queue alerts.",
    },
    posts: [POSTS[0]],
  },

  pharmacy: {
    id: "pharmacy",
    name: "Bwaila Community Pharmacy",
    handle: "@bwailapharmacy",
    kind: "Business",
    category: "On-Duty Community Pharmacy",
    neighborhood: "Old Town / Area 2",
    avatar: pharmacy,
    cover: pharmacy,
    bio: "Trusted community dispensary on Kamuzu Procession Rd. Night-duty shifts, certified prescription fulfillment, rapid diagnostic tests, and health care.",
    stats: {
      postsCount: 1,
      followers: 340,
      following: 12,
      rating: 4.8,
      reviewsCount: 64,
      statA: { label: "Rating", value: "4.8 ★" },
      statB: { label: "Shift", value: "On-Duty" },
      statC: { label: "Reviews", value: 64 },
    },
    info: {
      headline: "Trusted Community Pharmacy & Health Depot",
      about:
        "Serving neighborhood residents for over two decades. Dedicated night-duty dispensing window, licensed clinical pharmacists, blood pressure & glucose checks, and traveler consultations.",
      hoursOrSchedule: "Mon – Sat: 08:00 – 23:00 (On-duty emergency rotation 24h)",
      location: "Kamuzu Procession Rd 44, Area 2",
      phone: "+265 1 751 890",
      badges: [
        "Late Night On-Duty",
        "Licensed Pharmacist",
        "Blood Pressure Check",
        "Wheelchair Friendly",
      ],
      calendarHabits:
        "Official late-night emergency rota updates and seasonal pediatric & health stock alerts.",
    },
    posts: [POSTS[4]],
  },

  "chambo-grill": {
    id: "chambo-grill",
    name: "Kachere Chambo & Braai",
    handle: "@kacherebraai",
    kind: "Business",
    category: "Lake Fish & Charcoal Braai",
    neighborhood: "Gateway Mall, Area 47",
    avatar: chambo,
    cover: chambo,
    bio: "Authentic charcoal braai specializing in fresh lake catch, seasoned cuts, spiced relish, and chilled drinks on our garden terrace.",
    stats: {
      postsCount: 1,
      followers: 920,
      following: 36,
      rating: 4.9,
      reviewsCount: 92,
      statA: { label: "Rating", value: "4.9 ★" },
      statB: { label: "Daily Catch", value: "Fresh" },
      statC: { label: "Reviews", value: 92 },
    },
    info: {
      headline: "Fresh Grilled Fish & Authentic Charcoal Braai",
      about:
        "Fresh catch delivered daily. Each fish is seasoned with aromatic herbs and slow-grilled over charcoal to tender perfection. Enjoy with crispy potato wedges and freshly diced kachumbari.",
      hoursOrSchedule: "Mon – Sun: 11:30 – 22:30",
      location: "Gateway Mall Terrace, Area 47",
      phone: "+265 1 774 880",
      website: "kacherebraai.com",
      badges: [
        "Fresh Daily Catch",
        "Charcoal Braai",
        "Garden Terrace",
        "Takeaway & Dine-In",
        "Mobile Pay Accepted",
      ],
      calendarHabits:
        "Fresh catch arrivals at 11:00 and sunset weekend braai specials.",
    },
    posts: [POSTS[5]],
  },

  "kondwani-coffee": {
    id: "kondwani-coffee",
    name: "Kondwani Banda",
    handle: "@kondwanibanda",
    kind: "Person",
    category: "Coffee Explorer & Cyclist",
    neighborhood: "Area 43",
    avatar: coffee,
    cover: coffee,
    bio: "Weekend road cyclist and specialty coffee pursuer. Documenting the finest single-origin roasts and morning bakeries around town.",
    stats: {
      postsCount: 1,
      followers: 230,
      following: 94,
      rating: 4.8,
      reviewsCount: 29,
      statA: { label: "Saved", value: 12 },
      statB: { label: "Following", value: 94 },
      statC: { label: "Followers", value: 230 },
    },
    info: {
      headline: "Specialty Coffee Pursuer & Cyclist",
      about:
        "Riding the quiet back roads of Area 43 and Area 10. Always on the hunt for honey-process single origins and warm bakery pastries.",
      hoursOrSchedule: "Active morning rides (06:30–09:00)",
      location: "Area 43",
      badges: ["Early Riser", "Coffee Aficionado", "Cyclist"],
      calendarHabits: "Morning coffee drop alerts and weekend group ride routes.",
      social: "@kondwani_cycles",
    },
    posts: [POSTS[9]],
  },

  "dalitso-photo": {
    id: "dalitso-photo",
    name: "Dalitso Phiri",
    handle: "@dalitsophiri",
    kind: "Person",
    category: "Wildlife & Nature Photographer",
    neighborhood: "Sanctuary / Area 3",
    avatar: nature,
    cover: nature,
    bio: "Conservation storyteller & nature photographer. Documenting birdlife along the river trails and organizing community photo walks.",
    stats: {
      postsCount: 1,
      followers: 480,
      following: 134,
      rating: 4.9,
      reviewsCount: 54,
      statA: { label: "Walks", value: 18 },
      statB: { label: "Photos", value: "340" },
      statC: { label: "Followers", value: 480 },
    },
    info: {
      headline: "Conservation Storyteller & Photographer",
      about:
        "Capturing indigenous biodiversity along local trails. Join our monthly community nature walks along the river nature trails.",
      hoursOrSchedule: "Golden hours: 06:00–08:00 & 16:30–18:00",
      location: "Wildlife Sanctuary Nature Trail, Kenyatta Drive",
      badges: ["Wildlife Guide", "Creator", "Trail Leader"],
      calendarHabits: "Sunset photo walk reminders and seasonal bird migration alerts.",
      social: "@dalitso_wild",
    },
    posts: [POSTS[10]],
  },
};

export function getProfile(query?: string | null): UserProfile {
  if (!query) return PROFILES.chisomo;

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

  return PROFILES.chisomo;
}
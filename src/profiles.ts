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
const chambo = require("../assets/images/place-chambo.jpg");
const evCharge = require("../assets/images/place-chambo.jpg");

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
  chisomo: {
    id: "chisomo",
    name: "Chisomo Banda",
    handle: "@chisomo",
    kind: "Person",
    category: "Local Guide & Cultural Curator",
    neighborhood: "Area 10 & Old Town, Lilongwe",
    avatar: avatarAmara,
    cover: coverAmara,
    bio: "Exploring Lilongwe's quiet shaded lanes, artisanal coffee roasters, and live acoustic sessions by the sanctuary. Cyclist & neighborhood archivist.",
    stats: {
      postsCount: 3,
      statA: { label: "Saved", value: 6 },
      statB: { label: "Following", value: 168 },
      statC: { label: "Followers", value: 412 },
    },
    info: {
      headline: "Hyperlocal Lilongwe Curator & Morning Cyclist",
      about:
        "Passionate about neighborhood mobility, independent bakeries, and open-air acoustic sets across Lilongwe. I track fresh morning sourdough batches in Area 10, acoustic sessions along the Lingadzi river trails, and organic produce drops in Old Town.",
      hoursOrSchedule: "Active weekday mornings (07:00–09:30) & weekend afternoons",
      location: "Presidential Way, Area 10, Lilongwe",
      memberSince: "Member since January 2024",
      badges: [
        "Verified Guide",
        "Early Riser",
        "Area 10 Local",
        "Acoustic Enthusiast",
      ],
      calendarHabits:
        "Shares fresh bakery batches, weekly farmer produce drops, and live acoustic sanctuary session reminders.",
      social: "@chisomo_llw",
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
    neighborhood: "Area 10, Lilongwe",
    avatar: bakery,
    cover: bakery,
    bio: "Artisanal bakery and specialty café in Area 10. Slow-fermented sourdough loaves, cardamom morning buns, and warm almond croissants baked fresh twice daily.",
    stats: {
      postsCount: 2,
      statA: { label: "Rating", value: "4.9 ★" },
      statB: { label: "Batches", value: "2 / day" },
      statC: { label: "Followers", value: "1.4k" },
    },
    info: {
      headline: "Wood-Fired Bakery & Specialty Coffee",
      about:
        "Every loaf is naturally fermented for 24 hours using local stoneground flours and baked fresh in our brick oven. Pair our famous warm croissants with single-origin coffee from northern Malawi's Misuku Hills.",
      hoursOrSchedule: "Tue – Sun: 07:00 – 18:00 (Mon closed)",
      location: "14 Presidential Way, Area 10, Lilongwe",
      phone: "+265 1 772 400",
      website: "mabubakes.mw",
      social: "@mabubakes_llw",
      memberSince: "Partner since Jan 2023",
      badges: [
        "Stoneground Flour",
        "Misuku Coffee",
        "Garden Seating",
        "Airtel / Mo626 Accepted",
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
    neighborhood: "Lilongwe Wildlife Sanctuary, Kenyatta Drive",
    avatar: concert,
    cover: concert,
    bio: "Sunset acoustic sessions and open-air performances under the sanctuary forest canopy. Acoustic folk, afro-soul, and indie strings. Free entry.",
    stats: {
      postsCount: 2,
      statA: { label: "Sessions", value: 32 },
      statB: { label: "Rating", value: "5.0 ★" },
      statC: { label: "Followers", value: "3.2k" },
    },
    info: {
      headline: "Open-Air Music & Cultural Gatherings",
      about:
        "We curate independent Malawian musicians and intimate acoustic performances beneath the ancient indigenous trees of the Lilongwe Wildlife Sanctuary. Bring picnic blankets, baobab juice, and friends. Low decibel, family friendly.",
      hoursOrSchedule: "Bi-weekly Fri & Sat: 17:30 – 21:30 (Acoustic sets start at 18:30)",
      location: "Lilongwe Wildlife Sanctuary, Kenyatta Drive, Lilongwe",
      website: "lingadzisessions.mw",
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
        "Bi-weekly dry season weekend acoustic sets along the sanctuary nature trail.",
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
    neighborhood: "Four Seasons, Area 12, Lilongwe",
    avatar: market,
    cover: market,
    bio: "Hosting Saturday garden markets, indigenous botanical craft stalls, and seed-saving corners at Four Seasons. Passionate about agroecology and local food heritage.",
    stats: {
      postsCount: 2,
      statA: { label: "Markets", value: 24 },
      statB: { label: "Trust", value: "100%" },
      statC: { label: "Followers", value: 580 },
    },
    info: {
      headline: "Market Coordinator & Botanical Herbalist",
      about:
        "Organizing the Four Seasons Saturday gathering for 5 years. Connecting Dedza organic vegetable growers, Salima fruit farmers, natural beeswax crafters, and local herbal tea blenders in a relaxed garden atmosphere.",
      hoursOrSchedule: "Every Saturday: 08:00 – 14:00",
      location: "Four Seasons Gardens, Presidential Way, Area 12, Lilongwe",
      social: "@tamanda_herbs",
      memberSince: "Member since Sept 2023",
      badges: [
        "Community Host",
        "Zero Chemical",
        "Seed Swap",
        "Dog Friendly",
      ],
      calendarHabits:
        "Saturday morning organic harvest drops and monthly indigenous plant swaps.",
    },
    posts: [
      POSTS[3],
      {
        ...POSTS[3],
        id: "market-herbs",
        title: "Indigenous Tree & Herb Seedling Swap",
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
    neighborhood: "Kenyatta Drive, Area 3, Lilongwe",
    avatar: fuel,
    cover: fuel,
    bio: "24/7 service station with clean fuels, tyre service, automated wash, and a 24hr Quick-Shop for snacks and fresh barista coffee on Kenyatta Drive.",
    stats: {
      postsCount: 1,
      statA: { label: "Rating", value: "4.8 ★" },
      statB: { label: "Status", value: "24 / 7" },
      statC: { label: "Reviews", value: 142 },
    },
    info: {
      headline: "Full-Service 24/7 Fuel Station & Quick-Shop",
      about:
        "Centrally positioned on Kenyatta Drive in Area 3. Clean fuel dispensers, high-pressure foam wash, 24hr Quick-Shop, ATM, and reliable power backup.",
      hoursOrSchedule: "Open 24 hours, 7 days a week",
      location: "Kenyatta Drive, Area 3, Lilongwe",
      phone: "+265 1 754 110",
      badges: [
        "Open 24/7",
        "24hr Quick-Shop",
        "Express Wash",
        "Tyre Service",
        "Card & Mobile Money",
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
    neighborhood: "Old Town / Area 2, Lilongwe",
    avatar: pharmacy,
    cover: pharmacy,
    bio: "Trusted community dispensary on Kamuzu Procession Rd. Night-duty shifts, certified prescription fulfillment, rapid diagnostic tests, and health care.",
    stats: {
      postsCount: 1,
      statA: { label: "Rating", value: "4.8 ★" },
      statB: { label: "Shift", value: "On-Duty" },
      statC: { label: "Reviews", value: 64 },
    },
    info: {
      headline: "Trusted Community Pharmacy & Health Depot",
      about:
        "Serving Lilongwe residents for over two decades. Dedicated night-duty dispensing window, licensed clinical pharmacists, blood pressure & glucose checks, and traveler consultations.",
      hoursOrSchedule: "Mon – Sat: 08:00 – 23:00 (On-duty emergency rotation 24h)",
      location: "Kamuzu Procession Rd 44, Area 2, Lilongwe",
      phone: "+265 1 751 890",
      badges: [
        "Late Night On-Duty",
        "Licensed Pharmacist",
        "Blood Pressure Check",
        "Wheelchair Friendly",
      ],
      calendarHabits:
        "Official late-night emergency rota updates and seasonal pediatric & antimalarial stock alerts.",
    },
    posts: [POSTS[4]],
  },

  "chambo-grill": {
    id: "chambo-grill",
    name: "Kachere Chambo & Braai",
    handle: "@kacherebraai",
    kind: "Business",
    category: "Lake Malawi Chambo & Charcoal Braai",
    neighborhood: "Gateway Mall, Area 47, Lilongwe",
    avatar: chambo,
    cover: chambo,
    bio: "Authentic charcoal braai specializing in fresh Lake Malawi Chambo fish, seasoned beef cuts, spiced kachumbari relish, and chilled drinks on our garden lawn.",
    stats: {
      postsCount: 1,
      statA: { label: "Rating", value: "4.9 ★" },
      statB: { label: "Daily Catch", value: "Fresh" },
      statC: { label: "Reviews", value: 92 },
    },
    info: {
      headline: "Fresh Lake Malawi Chambo & Authentic Charcoal Braai",
      about:
        "Freshly caught Chambo delivered daily from Lake Malawi. Each fish is seasoned with aromatic herbs and slow-grilled over charcoal to tender perfection. Enjoy with crispy potato wedges or hot nsima and freshly diced kachumbari.",
      hoursOrSchedule: "Mon – Sun: 11:30 – 22:30",
      location: "Gateway Mall Terrace, Area 47, Lilongwe",
      phone: "+265 1 774 880",
      website: "kacherebraai.mw",
      badges: [
        "Fresh Lake Catch",
        "Charcoal Braai",
        "Garden Terrace",
        "Takeaway & Dine-In",
        "Airtel / Mo626",
      ],
      calendarHabits:
        "Fresh lake catch arrivals at 11:00 and sunset weekend braai specials.",
    },
    posts: [POSTS[5]],
  },
};

// Aliases for backward compatibility
PROFILES["ev-charge"] = PROFILES["chambo-grill"];
PROFILES.amara = PROFILES.chisomo;

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

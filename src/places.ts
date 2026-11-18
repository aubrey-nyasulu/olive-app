import type { GuidanceStep, Post, Review, TravelMode } from "./models";

const fuel = require("../assets/images/place-fuel.jpg");
const concert = require("../assets/images/place-concert.jpg");
const bakery = require("../assets/images/place-bakery.jpg");
const market = require("../assets/images/place-market.jpg");
const pharmacy = require("../assets/images/place-pharmacy.jpg");
const chambo = require("../assets/images/place-chambo.jpg");
const evCharge = require("../assets/images/place-ev-charge.jpg");
const coffee = require("../assets/images/place-coffee.jpg");
const nature = require("../assets/images/place-nature.jpg");

export const POSTS: Post[] = [
  {
    id: "harbour-fuel",
    author: "Puma Energy",
    kind: "Business",
    category: "Fuel",
    title: "Open 24/7 — fast bays & 24hr Quick-Shop",
    body: "Clean diesel & petrol, tyre service, express car wash, and fresh Mzuzu barista coffee inside the 24hr Quick-Shop on Kenyatta Drive.",
    place: "Kenyatta Drive, Area 3",
    lat: -13.9785,
    lng: 33.7745,
    distanceKm: 0.8,
    when: "Open now",
    image: fuel,
    ratio: "1/1",
  },
  {
    id: "park-live",
    author: "Lingadzi Sessions",
    kind: "Event",
    category: "Concert",
    title: "Open-air acoustic set tonight, 18:30",
    body: "Acoustic guitar and kalimba sets under the indigenous woodland canopy. Bring a mat and relax on the sanctuary lawn.",
    place: "Lilongwe Wildlife Sanctuary",
    lat: -13.974,
    lng: 33.778,
    distanceKm: 2.1,
    when: "Tonight · 18:30",
    image: concert,
    ratio: "1/1",
  },
  {
    id: "forno",
    author: "Mabu Artisan Bakes",
    kind: "Business",
    category: "Bakery",
    title: "Almond croissants & sourdough just out",
    body: "Stone-baked sourdough loaves and warm honey almond croissants. Morning batch fresh until 11:00.",
    place: "14 Presidential Way, Area 10",
    lat: -13.9525,
    lng: 33.7815,
    distanceKm: 1.4,
    when: "Open until 18:30",
    image: bakery,
    ratio: "4/3",
  },
  {
    id: "saturday-market",
    author: "Tamanda Gondwe",
    kind: "Person",
    category: "Market",
    title: "Four Seasons Saturday market is buzzing",
    body: "Fresh Salima mangoes, papayas, Dedza mountain honey, and colorful chitenje crafts at Four Seasons Gardens.",
    place: "Four Seasons Gardens, Area 12",
    lat: -13.9605,
    lng: 33.786,
    distanceKm: 1.9,
    when: "Until 14:00",
    image: market,
    ratio: "4/3",
  },
  {
    id: "pharmacy",
    author: "Bwaila Community Pharmacy",
    kind: "Business",
    category: "Pharmacy",
    title: "On-duty dispensary open tonight",
    body: "Full dispensary service, essential medicines, rapid diagnostic tests, and clinical consultations on Kamuzu Procession Rd.",
    place: "Kamuzu Procession Rd 44, Area 2",
    lat: -13.981,
    lng: 33.769,
    distanceKm: 2.4,
    when: "Open until 00:00",
    image: pharmacy,
    ratio: "4/3",
  },
  {
    id: "chambo-grill",
    author: "Kachere Chambo & Braai",
    kind: "Business",
    category: "Dining",
    title: "Fresh Lake Chambo sizzling on charcoal",
    body: "Daily catch from Lake Malawi grilled over hot coals. Served with spiced kachumbari relish and crispy potato wedges on the garden terrace.",
    place: "Gateway Mall Terrace, Area 47",
    lat: -13.968,
    lng: 33.755,
    distanceKm: 0.4,
    when: "Open until 22:00",
    image: chambo,
    ratio: "4/3",
  },
  {
    id: "chisomo-bakery",
    author: "Chisomo Banda",
    kind: "Person",
    category: "Bakery",
    title: "Quiet morning terrace & warm sourdough",
    body: "Morning cycle down Presidential Way into Area 10. Sourdough loaves just cooled on the rack, courtyard terrace is sunny and peaceful.",
    place: "Presidential Way, Area 10",
    lat: -13.9535,
    lng: 33.7825,
    distanceKm: 0.7,
    when: "Fresh · 07:45",
    image: bakery,
    ratio: "4/3",
  },
  {
    id: "chisomo-acoustic-set",
    author: "Chisomo Banda",
    kind: "Person",
    category: "Concert",
    title: "Acoustic strings under the acacia trees",
    body: "Spontaneous acoustic guitar and kalimba session along the sanctuary nature trail. Bring a mat; grass is dry.",
    place: "Lilongwe Wildlife Sanctuary",
    lat: -13.974,
    lng: 33.778,
    distanceKm: 1.2,
    when: "Tonight · 18:30",
    image: concert,
    ratio: "1/1",
  },
  {
    id: "chisomo-market-finds",
    author: "Chisomo Banda",
    kind: "Person",
    category: "Market",
    title: "Sweet Salima mangoes & wild honey",
    body: "Saturday morning stalls in Old Town are vibrant. Organic mountain honey from Ntchisi and freshly roasted macadamia nuts.",
    place: "Old Town Market, Area 2",
    lat: -13.9825,
    lng: 33.7715,
    distanceKm: 0.5,
    when: "Open until 14:00",
    image: market,
    ratio: "4/3",
  },
  {
    id: "kondwani-coffee",
    author: "Kondwani Banda",
    kind: "Person",
    category: "Bakery",
    title: "Northern Misuku pour-over & cinnamon bun",
    body: "Morning cycling pause in Area 43. Incredible single-origin honey-processed coffee from northern Malawi and warm cinnamon buns on the shaded veranda.",
    place: "Area 43 Gardens",
    lat: -13.945,
    lng: 33.792,
    distanceKm: 1.8,
    when: "Morning drop · 08:15",
    image: coffee,
    ratio: "4/3",
  },
  {
    id: "dalitso-photo",
    author: "Dalitso Phiri",
    kind: "Person",
    category: "Concert",
    title: "Golden hour photo walk along Lingadzi",
    body: "Spotted giant kingfishers and purple-crested turacos along the nature sanctuary trail. Bringing lenses for the 17:30 light.",
    place: "Lilongwe Wildlife Sanctuary",
    lat: -13.972,
    lng: 33.776,
    distanceKm: 1.5,
    when: "Today · 17:00",
    image: nature,
    ratio: "1/1",
  },
];

export const CATEGORIES = Array.from(new Set(POSTS.map((p) => p.category)));

export const REVIEWS: Record<string, Review[]> = {
  "harbour-fuel": [
    {
      by: "Kondwani",
      stars: 5,
      text: "Quick in and out, pump attendants are swift and courteous.",
    },
    {
      by: "Tadala",
      stars: 4,
      text: "Clean forecourt and reliable card machines. Good spot.",
    },
  ],
  "park-live": [
    {
      by: "Thoko",
      stars: 5,
      text: "Incredible evening vibes by the sanctuary forest canopy. Bring a mat early!",
    },
  ],
  forno: [
    {
      by: "Dalitso",
      stars: 5,
      text: "The cardamom morning bun and warm almond croissant are unmatched.",
    },
    {
      by: "Chimwemwe",
      stars: 4,
      text: "Sells out fast on weekend mornings — get there before 09:30.",
    },
  ],
  "saturday-market": [
    {
      by: "Yamikani",
      stars: 4,
      text: "Fresh passion fruits, organic greens, and lovely handmade crafts.",
    },
  ],
  pharmacy: [
    {
      by: "Tionge",
      stars: 4,
      text: "Very helpful pharmacists even late at night, well stocked.",
    },
  ],
  "chambo-grill": [
    {
      by: "Limbani",
      stars: 5,
      text: "Best whole grilled Chambo in town, the kachumbari has just the right chili kick.",
    },
    {
      by: "Tadala",
      stars: 5,
      text: "Great atmosphere on the outdoor terrace, generous portions.",
    },
  ],
  "chisomo-bakery": [
    {
      by: "Blessings",
      stars: 5,
      text: "Found this spot through Chisomo's recommendation. Sourdough loaf is incredible!",
    },
  ],
  "chisomo-acoustic-set": [
    {
      by: "Matilda",
      stars: 5,
      text: "Magical atmosphere under the acacia trees, thank you for sharing.",
    },
  ],
  "chisomo-market-finds": [
    {
      by: "Dumisani",
      stars: 5,
      text: "The Salima mangoes and wild honey were top tier!",
    },
  ],
  "kondwani-coffee": [
    {
      by: "Matilda",
      stars: 5,
      text: "Great coffee stop! The cinnamon bun was still warm from the oven.",
    },
  ],
  "dalitso-photo": [
    {
      by: "Blessings",
      stars: 5,
      text: "Incredible light by the river trail, thanks for organizing the walk.",
    },
  ],
};

export function getPostById(id: string): Post | undefined {
  return POSTS.find((p) => p.id === id);
}

export function relatedPosts(post: Post): Post[] {
  return POSTS.filter(
    (other) =>
      other.id !== post.id &&
      (other.category === post.category || other.kind === post.kind)
  ).slice(0, 3);
}

/**
 * Calculates estimated travel duration based on user's mode and distance.
 */
export function estimateTravelMinutes(
  distanceKm: number,
  mode: TravelMode
): number {
  switch (mode) {
    case "walking":
      // ~4.8 km/h -> ~12.5 mins per km
      return Math.max(1, Math.round(distanceKm * 12.5));
    case "cycling":
      // ~15 km/h -> ~4 mins per km
      return Math.max(1, Math.round(distanceKm * 4));
    case "driving":
      // ~30 km/h city speed -> ~2 mins per km + 2 min buffer
      return Math.max(2, Math.round(distanceKm * 2.2 + 2));
  }
}

/**
 * Generates an intuitive in-app turn-by-turn route step list for a destination.
 */
export function generateGuidanceSteps(post: Post): GuidanceStep[] {
  return [
    {
      id: "step-1",
      instruction: "Head east toward the main avenue",
      distance: "120 m",
      iconName: "arrow-up",
      landmark: "Pass the street corner",
    },
    {
      id: "step-2",
      instruction: `Turn right onto direction of ${post.place.split(" ")[0]}`,
      distance: "350 m",
      iconName: "arrow-forward",
      landmark: "Continue straight along the shaded pavement",
    },
    {
      id: "step-3",
      instruction: "Keep straight through the small roundabout",
      distance: `${Math.max(0.3, post.distanceKm - 0.5).toFixed(1)} km`,
      iconName: "arrow-up",
      landmark: "Look for Olive landmark signals on your right",
    },
    {
      id: "step-4",
      instruction: `Arrive at ${post.author}`,
      distance: "50 m",
      iconName: "pin",
      landmark: post.place,
    },
  ];
}

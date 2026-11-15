import type { GuidanceStep, Post, Review, TravelMode } from "./models";

const fuel = require("../assets/images/place-fuel.jpg");
const concert = require("../assets/images/place-concert.jpg");
const bakery = require("../assets/images/place-bakery.jpg");
const market = require("../assets/images/place-market.jpg");
const pharmacy = require("../assets/images/place-pharmacy.jpg");
const evCharge = require("../assets/images/place-ev-charge.jpg");

export const POSTS: Post[] = [
  {
    id: "harbour-fuel",
    author: "Harbour Fuel",
    kind: "Business",
    category: "Fuel",
    title: "Open 24/7 — diesel down today",
    body: "Air, car wash and coffee on site. Easy exit back onto the ring road.",
    place: "Av. Brasília 12",
    lat: 38.6979,
    lng: -9.1937,
    distanceKm: 0.8,
    when: "Open now",
    image: fuel,
    ratio: "1/1",
  },
  {
    id: "park-live",
    author: "Jardim Sessions",
    kind: "Event",
    category: "Concert",
    title: "Open-air set tonight, 21:00",
    body: "Four local bands, free entry, food trucks from 19:00.",
    place: "Jardim da Estrela",
    lat: 38.7136,
    lng: -9.1597,
    distanceKm: 2.1,
    when: "Tonight · 21:00",
    image: concert,
    ratio: "1/1",
  },
  {
    id: "forno",
    author: "Forno Lento",
    kind: "Business",
    category: "Bakery",
    title: "Almond croissants just out",
    body: "Sourdough loaves restocked. Last batch usually gone by 11.",
    place: "R. da Esperança 41",
    lat: 38.7078,
    lng: -9.1569,
    distanceKm: 1.4,
    when: "Open until 19:00",
    image: bakery,
    ratio: "4/3",
  },
  {
    id: "saturday-market",
    author: "Marta Reis",
    kind: "Person",
    category: "Market",
    title: "The Saturday market is buzzing",
    body: "Best mangoes I've had all year, and a guy fixing bikes for €5.",
    place: "Praça das Flores",
    lat: 38.7149,
    lng: -9.1531,
    distanceKm: 1.9,
    when: "Until 14:00",
    image: market,
    ratio: "4/3",
  },
  {
    id: "pharmacy",
    author: "Farmácia Central",
    kind: "Business",
    category: "Pharmacy",
    title: "On-duty pharmacy tonight",
    body: "Open until midnight for prescriptions and essentials.",
    place: "Calçada do Combro 8",
    lat: 38.7105,
    lng: -9.1478,
    distanceKm: 2.4,
    when: "Open until 00:00",
    image: pharmacy,
    ratio: "4/3",
  },
  {
    id: "ev-charge",
    author: "VoltPoint",
    kind: "Business",
    category: "Fuel",
    title: "4 fast chargers free right now",
    body: "150 kW chargers, covered parking, café next door.",
    place: "R. Rodrigues Faria 103",
    lat: 38.7035,
    lng: -9.1789,
    distanceKm: 1.1,
    when: "Open now",
    image: evCharge,
    ratio: "4/3",
  },
  {
    id: "amara-campo-bakery",
    author: "Amara Boateng",
    kind: "Person",
    category: "Bakery",
    title: "Quiet morning terrace & warm sourdough",
    body: "Morning cycle through Campo de Ourique. Sourdough loaves just cooled on the rack, terrace is sunny and peaceful.",
    place: "R. Ferreira Borges 78",
    lat: 38.717,
    lng: -9.163,
    distanceKm: 0.7,
    when: "Fresh · 08:30",
    image: bakery,
    ratio: "4/3",
  },
  {
    id: "amara-estrela-sunset",
    author: "Amara Boateng",
    kind: "Person",
    category: "Concert",
    title: "Acoustic strings by the gazebo",
    body: "Spontaneous acoustic cello and Portuguese guitar session under the ficus trees. Bring a blanket; grass is dry.",
    place: "Jardim da Estrela",
    lat: 38.7136,
    lng: -9.1597,
    distanceKm: 1.2,
    when: "Tonight · 19:30",
    image: concert,
    ratio: "1/1",
  },
  {
    id: "amara-market-finds",
    author: "Amara Boateng",
    kind: "Person",
    category: "Market",
    title: "Fresh Alentejo figs & wildflowers",
    body: "Saturday morning corner stalls are buzzing. Organic herb grower from Sintra is back near the central fountain.",
    place: "Mercado de Campo de Ourique",
    lat: 38.7162,
    lng: -9.1654,
    distanceKm: 0.5,
    when: "Open until 14:00",
    image: market,
    ratio: "4/3",
  },
];

export const CATEGORIES = Array.from(new Set(POSTS.map((p) => p.category)));

export const REVIEWS: Record<string, Review[]> = {
  "harbour-fuel": [
    { by: "Rui", stars: 5, text: "Quick in and out, staff are friendly." },
    { by: "Ana", stars: 4, text: "Coffee is surprisingly good." },
  ],
  "park-live": [
    { by: "Inês", stars: 5, text: "Great vibe, get there early for a spot." },
  ],
  forno: [
    { by: "Tom", stars: 5, text: "The almond croissant is worth the queue." },
    { by: "Sofia", stars: 4, text: "Sells out fast — go before 10." },
  ],
  "saturday-market": [
    { by: "João", stars: 4, text: "Fresh fruit, fair prices, lively." },
  ],
  pharmacy: [
    { by: "Clara", stars: 4, text: "Helpful at night, short wait." },
  ],
  "ev-charge": [
    { by: "Miguel", stars: 5, text: "Chargers actually work, café is a bonus." },
  ],
  "amara-campo-bakery": [
    { by: "Lucas", stars: 5, text: "Found this spot through Amara's recommendation. Sourdough is incredible!" },
  ],
  "amara-estrela-sunset": [
    { by: "Matilde", stars: 5, text: "Magical atmosphere in the park, thank you for sharing." },
  ],
  "amara-market-finds": [
    { by: "Bruno", stars: 5, text: "The Alentejo figs were so sweet!" },
  ],
};

export function getPostById(id: string): Post | undefined {
  return POSTS.find((p) => p.id === id);
}

export function relatedPosts(post: Post): Post[] {
  return POSTS.filter(
    (other) =>
      other.id !== post.id &&
      (other.category === post.category || other.kind === post.kind),
  ).slice(0, 3);
}

/**
 * Calculates estimated travel duration based on user's mode and distance.
 */
export function estimateTravelMinutes(
  distanceKm: number,
  mode: TravelMode,
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

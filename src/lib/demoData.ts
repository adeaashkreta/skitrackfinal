import type { Resort, Booking, User } from "./api";
import zermattImg from "@/assets/resorts/zermatt.png";
import stmoritzImg from "@/assets/resorts/stmoritz.png";
import valdisereImg from "@/assets/resorts/valdisere.png";
import frostlineImg from "@/assets/frostline.jpg";
import glacierBayImg from "@/assets/glacier-bay.jpg";
import silverpineImg from "@/assets/silverpine.jpg";
import alexPool from "@/assets/resorts/alex/alex-pool.png";
import alexSpa from "@/assets/resorts/alex/alex-spa.png";
import alexBedroom from "@/assets/resorts/alex/alex-bedroom.png";
import alexShower from "@/assets/resorts/alex/alex-shower.png";
import alexRestaurant from "@/assets/resorts/alex/alex-restaurant.png";



export const demoResorts: Resort[] = [
  {
    _id: "r1",
    name: "Zermatt",
    location: "Zermatt, Switzerland",
    country: "Switzerland",
    tagline: "Ski in the shadow of the Matterhorn",
    description:
      "Year-round skiing at the foot of the Matterhorn. 360 km of pistes, glacier terrain reaching 3,883 m, and a charming car-free village.",
    whyFeatured:
      "Europe's highest lift-served terrain and the most photographed peak in the Alps, paired with a car-free village of timber chalets and Michelin-starred mountain restaurants.",
    pricePerDay: 245,
    difficulty: "Intermediate",
    image: zermattImg,
    rating: 4.9,
    features: ["360 km of pistes", "Year-round glacier", "Michelin dining", "Car-free village"],
    amenities: ["wifi", "spa", "bathtub", "hot-tub", "sauna"],
    activities: ["skiing", "snowboarding", "hiking"],
    maxGuests: 8,
    unavailableRanges: [{ from: "2026-06-15", to: "2026-06-22" }],
    coordinates: { lat: 45.9763, lon: 7.6586 },
    address: "Bodmenstrasse 12, 3920 Zermatt, Switzerland",
    gallery: [alexPool, alexSpa, alexBedroom, alexShower, alexRestaurant, zermattImg],
    reviewScore: 9.0,
    reviewCount: 202,
    reviewLabel: "Wonderful",
    reviewQuote: {
      text: "Lovely hotel, decor is full of character. There is a large swimming pool with excellent spa facilities. Great restaurant on site, by far my best…",
      author: "Maria",
      country: "United Kingdom",
    },
    popularFacilities: ["indoor-pool", "spa", "non-smoking", "restaurant", "fitness", "room-service", "family-rooms", "bar", "breakfast"],
    roomTypes: [
      {
        id: "budget-double",
        name: "Budget Double Room",
        beds: "2 twin beds",
        sizeM2: 22,
        view: "Mountain view",
        bathroom: "Private bathroom",
        tv: true,
        image: alexBedroom,
        capacity: 2,
        pricePerNight: 291,
        originalPrice: 364,
        discountPct: 20,
        left: 2,
        perks: ["Wonderful breakfast included", "Unlimited spa access", "High-speed internet", "Non-refundable"],
      },
      {
        id: "standard-double",
        name: "Standard Double Room",
        beds: "1 queen bed or 2 twin beds",
        sizeM2: 28,
        view: "Mountain view",
        bathroom: "Private bathroom",
        tv: true,
        image: alexBedroom,
        capacity: 2,
        pricePerNight: 326,
        originalPrice: 408,
        discountPct: 20,
        left: 3,
        perks: ["Wonderful breakfast included", "Unlimited spa access", "High-speed internet", "Non-refundable"],
      },
      {
        id: "luxury-suite",
        name: "Luxury Suite",
        beds: "1 king bed + lounge",
        sizeM2: 48,
        view: "Matterhorn view",
        bathroom: "Marble bathroom",
        tv: true,
        image: alexShower,
        capacity: 4,
        pricePerNight: 760,
        originalPrice: 950,
        discountPct: 20,
        left: 1,
        perks: ["Wonderful breakfast included", "Private balcony", "Unlimited spa access", "Free cancellation"],
      },
    ],
  },
  {
    _id: "r2",
    name: "St. Moritz",
    location: "St. Moritz, Switzerland",
    country: "Switzerland",
    tagline: "The original luxury alpine destination",
    description:
      "Birthplace of alpine winter tourism since 1864. 350 km of pistes, 322 days of sun a year, and two-time Winter Olympic host.",
    whyFeatured:
      "Where alpine tourism began in 1864 — 322 days of sun a year, two Winter Olympics, and an Engadin valley packed with grand-dame hotels, frozen-lake polo and a 5-star wellness culture.",
    pricePerDay: 320,
    difficulty: "Intermediate",
    image: stmoritzImg,
    rating: 4.9,
    features: ["350 km of pistes", "Frozen-lake events", "Grand-hotel spas", "Cresta Run"],
    amenities: ["wifi", "spa", "bathtub", "hot-tub", "sauna"],
    activities: ["skiing", "snowboarding", "hiking", "cycling"],
    maxGuests: 10,
    unavailableRanges: [{ from: "2026-07-01", to: "2026-07-10" }],
    coordinates: { lat: 46.4983, lon: 9.8378 },

  },
  {
    _id: "r3",
    name: "Val d'Isère",
    location: "Val d'Isère, France",
    country: "France",
    tagline: "Big-mountain skiing meets Savoyard charm",
    description:
      "Linked to Tignes for 300 km of Espace Killy terrain. Snow-sure to May with legendary off-piste and a stone-and-timber village.",
    whyFeatured:
      "300 km of Espace Killy linked terrain, reliably snow-sure to May, with some of the best lift-accessed off-piste in the Alps — all from a stone-and-timber village with serious après pedigree.",
    pricePerDay: 215,
    difficulty: "Advanced",
    image: valdisereImg,
    rating: 4.8,
    features: ["300 km Espace Killy", "Legendary off-piste", "Ski-in chalets", "Vibrant après"],
    amenities: ["wifi", "spa", "sauna"],
    activities: ["skiing", "snowboarding", "hiking", "cycling"],
    maxGuests: 6,
    unavailableRanges: [{ from: "2026-06-08", to: "2026-06-14" }],
    coordinates: { lat: 45.4486, lon: 6.9800 },

  },
  {
    _id: "r4",
    name: "Frostline Lodge",
    location: "Whistler, Canada",
    description:
      "North America's largest ski area. Friendly slopes, lively village, and reliable Pacific powder.",
    pricePerDay: 175,
    difficulty: "Beginner",
    image: frostlineImg,

    rating: 4.6,
    amenities: ["wifi", "spa", "hot-tub"],
    activities: ["skiing", "snowboarding", "hiking", "cycling"],
    maxGuests: 4,
    unavailableRanges: [{ from: "2026-06-20", to: "2026-06-30" }],
    coordinates: { lat: 50.1163, lon: -122.9574 },

  },
  {
    _id: "r5",
    name: "Glacier Bay Resort",
    location: "Niseko, Japan",
    description:
      "Legendary Japow. Light, dry snow and tree skiing under the watchful eye of Mt. Yotei.",
    pricePerDay: 198,
    difficulty: "Intermediate",
    image: glacierBayImg,

    rating: 4.8,
    amenities: ["wifi", "bathtub", "hot-tub", "sauna"],
    activities: ["skiing", "snowboarding"],
    maxGuests: 6,
    unavailableRanges: [],
    coordinates: { lat: 42.8048, lon: 140.6874 },

  },
  {
    _id: "r6",
    name: "Silverpine Heights",
    location: "St. Anton, Austria",
    description:
      "Steep, deep and legendary après-ski. A must for confident skiers chasing big mountain lines.",
    pricePerDay: 165,
    difficulty: "Advanced",
    image: silverpineImg,

    rating: 4.5,
    amenities: ["wifi", "sauna"],
    activities: ["skiing", "snowboarding", "hiking"],
    maxGuests: 5,
    unavailableRanges: [{ from: "2026-07-15", to: "2026-07-25" }],
    coordinates: { lat: 47.1297, lon: 10.2647 },

  },
];

export const demoBookings: Booking[] = [
  {
    _id: "b1",
    user: "u1",
    resort: demoResorts[0],
    startDate: "2026-01-12",
    endDate: "2026-01-18",
    guests: 2,
    totalPrice: 245 * 6 * 2,
    status: "confirmed",
    createdAt: "2025-11-20",
  },
  {
    _id: "b2",
    user: "u1",
    resort: demoResorts[3],
    startDate: "2026-02-02",
    endDate: "2026-02-05",
    guests: 4,
    totalPrice: 175 * 3 * 4,
    status: "pending",
    createdAt: "2025-12-01",
  },
];

export const demoUsers: User[] = [
  { _id: "u1", name: "Alex Morgan", email: "alex@example.com", role: "user", createdAt: "2025-09-10" },
  { _id: "u2", name: "Jamie Lee", email: "jamie@example.com", role: "user", createdAt: "2025-10-02" },
  { _id: "u3", name: "Admin User", email: "admin@skitrack.com", role: "super_admin", createdAt: "2025-08-01" },
  { _id: "u4", name: "Sofia Brunner", email: "manager@skitrack.com", role: "resort_manager", createdAt: "2025-08-15" },
];

// Assign demo resorts to the demo manager so the manager dashboard shows real listings.
demoResorts[0].managerId = "u4"; // Zermatt
demoResorts[1].managerId = "u4"; // St. Moritz
demoResorts[3].managerId = "u4"; // Frostline

import type { Ticket } from "./api";

export const demoTickets: Ticket[] = [
  {
    _id: "t1",
    userId: "u1",
    userName: "Alex Morgan",
    resortId: "r1",
    resortName: "Zermatt",
    subject: "Late check-in possible?",
    status: "open",
    createdAt: "2025-12-05T10:00:00Z",
    updatedAt: "2025-12-05T10:00:00Z",
    messages: [
      {
        author: "Alex Morgan",
        authorRole: "user",
        body: "Hi, our flight lands at 23:30 — can we still check in that night?",
        createdAt: "2025-12-05T10:00:00Z",
      },
    ],
  },
  {
    _id: "t2",
    userId: "u2",
    userName: "Jamie Lee",
    resortId: "r3",
    resortName: "Val d'Isère",
    subject: "Ski rental package",
    status: "pending",
    createdAt: "2025-12-01T08:30:00Z",
    updatedAt: "2025-12-02T14:00:00Z",
    messages: [
      {
        author: "Jamie Lee",
        authorRole: "user",
        body: "Do you offer ski + boots packages on site?",
        createdAt: "2025-12-01T08:30:00Z",
      },
      {
        author: "Resort Manager",
        authorRole: "resort_manager",
        body: "Yes — full package from €45/day, bookable at reception.",
        createdAt: "2025-12-02T14:00:00Z",
      },
    ],
  },
];


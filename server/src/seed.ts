// Seed script — populates the 2 standard accounts and the 6 resorts.
// Run with `npm run seed`. Idempotent: wipes & re-inserts.
//
// Image paths reference files in the frontend `public/` folder, served by
// Vite at /resorts/<file> and /avatars/<file>.

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./db";
import { User } from "./models/User";
import { Resort } from "./models/Resort";
import { Ticket } from "./models/Ticket";
import { Booking } from "./models/Booking";

const PASSWORD = "123123123";

async function main() {
  await connectDB();
  // eslint-disable-next-line no-console
  console.log("[seed] clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    Resort.deleteMany({}),
    Ticket.deleteMany({}),
    Booking.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const [admin, manager] = await User.create([
    { name: "Joni Admin", email: "admin@joni.com", role: "super_admin", passwordHash },
    { name: "Adea Manager", email: "manager@adea.com", role: "resort_manager", passwordHash },
  ]);
  void admin;

  const resorts = await Resort.create([
    {
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
      image: "/resorts/zermatt.png",
      rating: 4.9,
      managerId: manager._id,
      features: ["360 km of pistes", "Year-round glacier", "Michelin dining", "Car-free village"],
      amenities: ["wifi", "spa", "bathtub", "hot-tub", "sauna"],
      activities: ["skiing", "snowboarding", "hiking"],
      maxGuests: 8,
      unavailableRanges: [{ from: "2026-06-15", to: "2026-06-22" }],
      coordinates: { lat: 45.9763, lon: 7.6586 },
      address: "Bodmenstrasse 12, 3920 Zermatt, Switzerland",
      gallery: [
        "/resorts/alex-pool.png",
        "/resorts/alex-spa.png",
        "/resorts/alex-bedroom.png",
        "/resorts/alex-shower.png",
        "/resorts/alex-restaurant.png",
        "/resorts/zermatt.png",
      ],
      reviewScore: 9.0,
      reviewCount: 202,
      reviewLabel: "Wonderful",
      reviewQuote: {
        text: "Lovely hotel, decor is full of character. There is a large swimming pool with excellent spa facilities. Great restaurant on site, by far my best…",
        author: "Maria",
        country: "United Kingdom",
      },
      popularFacilities: [
        "indoor-pool",
        "spa",
        "non-smoking",
        "restaurant",
        "fitness",
        "room-service",
        "family-rooms",
        "bar",
        "breakfast",
      ],
      roomTypes: [
        {
          id: "budget-double",
          name: "Budget Double Room",
          beds: "2 twin beds",
          sizeM2: 22,
          view: "Mountain view",
          bathroom: "Private bathroom",
          tv: true,
          image: "/resorts/alex-bedroom.png",
          capacity: 2,
          pricePerNight: 291,
          originalPrice: 364,
          discountPct: 20,
          left: 2,
          perks: [
            "Wonderful breakfast included",
            "Unlimited spa access",
            "High-speed internet",
            "Non-refundable",
          ],
        },
        {
          id: "standard-double",
          name: "Standard Double Room",
          beds: "1 queen bed or 2 twin beds",
          sizeM2: 28,
          view: "Mountain view",
          bathroom: "Private bathroom",
          tv: true,
          image: "/resorts/alex-bedroom.png",
          capacity: 2,
          pricePerNight: 326,
          originalPrice: 408,
          discountPct: 20,
          left: 3,
          perks: [
            "Wonderful breakfast included",
            "Unlimited spa access",
            "High-speed internet",
            "Non-refundable",
          ],
        },
        {
          id: "luxury-suite",
          name: "Luxury Suite",
          beds: "1 king bed + lounge",
          sizeM2: 48,
          view: "Matterhorn view",
          bathroom: "Marble bathroom",
          tv: true,
          image: "/resorts/alex-shower.png",
          capacity: 4,
          pricePerNight: 760,
          originalPrice: 950,
          discountPct: 20,
          left: 1,
          perks: [
            "Wonderful breakfast included",
            "Private balcony",
            "Unlimited spa access",
            "Free cancellation",
          ],
        },
      ],
    },
    {
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
      image: "/resorts/stmoritz.png",
      rating: 4.9,
      managerId: manager._id,
      features: ["350 km of pistes", "Frozen-lake events", "Grand-hotel spas", "Cresta Run"],
      amenities: ["wifi", "spa", "bathtub", "hot-tub", "sauna"],
      activities: ["skiing", "snowboarding", "hiking", "cycling"],
      maxGuests: 10,
      unavailableRanges: [{ from: "2026-07-01", to: "2026-07-10" }],
      coordinates: { lat: 46.4983, lon: 9.8378 },
    },
    {
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
      image: "/resorts/valdisere.png",
      rating: 4.8,
      features: ["300 km Espace Killy", "Legendary off-piste", "Ski-in chalets", "Vibrant après"],
      amenities: ["wifi", "spa", "sauna"],
      activities: ["skiing", "snowboarding", "hiking", "cycling"],
      maxGuests: 6,
      unavailableRanges: [{ from: "2026-06-08", to: "2026-06-14" }],
      coordinates: { lat: 45.4486, lon: 6.98 },
    },
    {
      name: "Frostline Lodge",
      location: "Whistler, Canada",
      country: "Canada",
      description:
        "North America's largest ski area. Friendly slopes, lively village, and reliable Pacific powder.",
      pricePerDay: 175,
      difficulty: "Beginner",
      image: "/resorts/frostline.jpg",
      rating: 4.6,
      managerId: manager._id,
      amenities: ["wifi", "spa", "hot-tub"],
      activities: ["skiing", "snowboarding", "hiking", "cycling"],
      maxGuests: 4,
      unavailableRanges: [{ from: "2026-06-20", to: "2026-06-30" }],
      coordinates: { lat: 50.1163, lon: -122.9574 },
    },
    {
      name: "Glacier Bay Resort",
      location: "Niseko, Japan",
      country: "Japan",
      description:
        "Legendary Japow. Light, dry snow and tree skiing under the watchful eye of Mt. Yotei.",
      pricePerDay: 198,
      difficulty: "Intermediate",
      image: "/resorts/glacier-bay.jpg",
      rating: 4.8,
      amenities: ["wifi", "bathtub", "hot-tub", "sauna"],
      activities: ["skiing", "snowboarding"],
      maxGuests: 6,
      unavailableRanges: [],
      coordinates: { lat: 42.8048, lon: 140.6874 },
    },
    {
      name: "Silverpine Heights",
      location: "St. Anton, Austria",
      country: "Austria",
      description:
        "Steep, deep and legendary après-ski. A must for confident skiers chasing big mountain lines.",
      pricePerDay: 165,
      difficulty: "Advanced",
      image: "/resorts/silverpine.jpg",
      rating: 4.5,
      amenities: ["wifi", "sauna"],
      activities: ["skiing", "snowboarding", "hiking"],
      maxGuests: 5,
      unavailableRanges: [{ from: "2026-07-15", to: "2026-07-25" }],
      coordinates: { lat: 47.1297, lon: 10.2647 },
    },
  ]);

  // eslint-disable-next-line no-console
  console.log(
    `[seed] done. ${resorts.length} resorts inserted. Login as admin@joni.com or manager@adea.com — password: ${PASSWORD}`,
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] failed:", err);
  process.exit(1);
});

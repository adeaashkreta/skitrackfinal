export const resorts = [
  {
    id: 1,
    name: "Brezovica Ski Resort",
    country: "Kosovo",
    city: "Štrpce",
    address: "Brezovica, Štrpce, Kosovo",
    latitude: 42.2211,
    longitude: 21.0003,
    description:
      "Brezovica is one of the most popular ski resorts in Kosovo, offering slopes, lifts, rental services and beautiful mountain views.",
    difficultyLevel: "intermediate",
    isActive: true,

    image: "/images/resorts/brezovica.jpg",

    condition: {
      temperature: -4,
      weatherStatus: "Snowy",
      snowDepthCm: 80,
      slopeCondition: "good",
      visibility: "Good",
      windSpeed: 12,
      recordedAt: "2026-01-15 09:00",
    },

    slopes: [
      {
        id: 1,
        name: "Blue Valley",
        difficulty: "intermediate",
        lengthM: 1800,
        status: "open",
      },
      {
        id: 2,
        name: "Black Peak",
        difficulty: "advanced",
        lengthM: 2400,
        status: "closed",
      },
      {
        id: 3,
        name: "Beginner Line",
        difficulty: "beginner",
        lengthM: 900,
        status: "open",
      },
    ],

    lifts: [
      {
        id: 1,
        name: "Main Chairlift",
        liftType: "chairlift",
        status: "open",
        capacityPerHour: 1200,
      },
      {
        id: 2,
        name: "Mountain Drag Lift",
        liftType: "drag_lift",
        status: "open",
        capacityPerHour: 800,
      },
    ],

    facilities: ["Parking", "Restaurant", "Ski School", "Rental Shop"],

    services: [
      {
        id: 1,
        name: "Daily Ski Pass",
        price: 25,
        duration: "1 day",
        isAvailable: true,
      },
      {
        id: 2,
        name: "Ski Lesson",
        price: 40,
        duration: "2 hours",
        isAvailable: true,
      },
    ],

    reviews: {
      averageRating: 4.6,
      totalReviews: 128,
    },
  },

  {
    id: 2,
    name: "Popova Shapka",
    country: "North Macedonia",
    city: "Tetovo",
    address: "Popova Shapka, Tetovo, North Macedonia",
    latitude: 42.0134,
    longitude: 20.8808,
    description:
      "Popova Shapka is a mountain ski resort known for advanced slopes, good snow conditions and winter tourism.",
    difficultyLevel: "advanced",
    isActive: true,

    image: "/images/resorts/popova-shapka.jpg",

    condition: {
      temperature: -6,
      weatherStatus: "Cloudy",
      snowDepthCm: 120,
      slopeCondition: "excellent",
      visibility: "Moderate",
      windSpeed: 18,
      recordedAt: "2026-01-15 09:30",
    },

    slopes: [
      {
        id: 1,
        name: "Advanced Ridge",
        difficulty: "advanced",
        lengthM: 2600,
        status: "open",
      },
      {
        id: 2,
        name: "Forest Track",
        difficulty: "intermediate",
        lengthM: 1900,
        status: "open",
      },
    ],

    lifts: [
      {
        id: 1,
        name: "Peak Chairlift",
        liftType: "chairlift",
        status: "open",
        capacityPerHour: 1000,
      },
      {
        id: 2,
        name: "Old Cable Lift",
        liftType: "cable_car",
        status: "maintenance",
        capacityPerHour: 600,
      },
    ],

    facilities: ["Hotel", "Restaurant", "Rental Shop", "Mountain Café"],

    services: [
      {
        id: 1,
        name: "Daily Ski Pass",
        price: 30,
        duration: "1 day",
        isAvailable: true,
      },
      {
        id: 2,
        name: "Guided Ski Tour",
        price: 55,
        duration: "3 hours",
        isAvailable: true,
      },
    ],

    reviews: {
      averageRating: 4.4,
      totalReviews: 94,
    },
  },

  {
    id: 3,
    name: "Bansko Ski Resort",
    country: "Bulgaria",
    city: "Bansko",
    address: "Pirin Mountains, Bansko, Bulgaria",
    latitude: 41.8371,
    longitude: 23.4894,
    description:
      "Bansko is one of the most famous ski resorts in Bulgaria, offering modern lifts, long ski slopes, vibrant nightlife and excellent winter conditions.",
    difficultyLevel: "mixed",
    isActive: true,

    image: "/images/resorts/bansko.jpg",

    condition: {
      temperature: -5,
      weatherStatus: "Sunny",
      snowDepthCm: 110,
      slopeCondition: "excellent",
      visibility: "Excellent",
      windSpeed: 11,
      recordedAt: "2026-01-15 10:00",
    },

    slopes: [
      {
        id: 1,
        name: "Family Run",
        difficulty: "beginner",
        lengthM: 1400,
        status: "open",
      },
      {
        id: 2,
        name: "Pirin Track",
        difficulty: "intermediate",
        lengthM: 2500,
        status: "open",
      },
      {
        id: 3,
        name: "Black Summit",
        difficulty: "expert",
        lengthM: 3200,
        status: "closed",
      },
    ],

    lifts: [
      {
        id: 1,
        name: "Main Gondola",
        liftType: "gondola",
        status: "open",
        capacityPerHour: 2000,
      },
      {
        id: 2,
        name: "Snow Peak Chairlift",
        liftType: "chairlift",
        status: "open",
        capacityPerHour: 1400,
      },
    ],

    facilities: ["Parking", "Hotel", "Restaurant", "Ski School", "Rental Shop"],

    services: [
      {
        id: 1,
        name: "Daily Ski Pass",
        price: 38,
        duration: "1 day",
        isAvailable: true,
      },
      {
        id: 2,
        name: "Family Ski Package",
        price: 95,
        duration: "1 day",
        isAvailable: true,
      },
    ],

    reviews: {
      averageRating: 4.8,
      totalReviews: 210,
    },
  },
];

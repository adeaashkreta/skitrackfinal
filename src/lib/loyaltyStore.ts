import type { Booking } from "./api";

export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

const TIERS: Array<{ tier: Tier; min: number; perks: string[] }> = [
  { tier: "Bronze", min: 0, perks: ["Member-only rates", "Free cancellation up to 48h"] },
  { tier: "Silver", min: 500, perks: ["5% off all bookings", "Late checkout", "Welcome drink"] },
  { tier: "Gold", min: 1500, perks: ["10% off", "Room upgrade when available", "Daily breakfast"] },
  { tier: "Platinum", min: 3000, perks: ["15% off", "Guaranteed upgrade", "Spa credit", "Priority support"] },
];

export const POINTS_PER_DOLLAR = 10;

export function pointsForBooking(b: Booking): number {
  if (b.status === "cancelled") return 0;
  return Math.round(b.totalPrice * POINTS_PER_DOLLAR);
}

export function totalPoints(bookings: Booking[]): number {
  return bookings.reduce((sum, b) => sum + pointsForBooking(b), 0);
}

export function getTier(points: number) {
  const current = [...TIERS].reverse().find((t) => points >= t.min) ?? TIERS[0];
  const idx = TIERS.findIndex((t) => t.tier === current.tier);
  const next = TIERS[idx + 1];
  return { current, next, allTiers: TIERS };
}

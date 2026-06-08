// Profile preferences store. API-first when `apiEnabled()` is true, otherwise localStorage.
import { apiEnabled, profileApi, type ProfilePreferencesDTO } from "./api";

const KEY = "skitrack_profile";
const EVENT = "profile:changed";

export type Climate = "Tropical" | "Mountain" | "City" | "Desert";
export type RoomPref = "Standard" | "Suite" | "Villa";
export type Diet = "Vegetarian" | "Vegan" | "Halal" | "Kosher" | "Gluten-free";

export interface ProfileData {
  // Personal
  phone: string;
  dob: string; // YYYY-MM-DD
  street: string;
  city: string;
  country: string;
  language: string;
  currency: string;
  // Travel preferences
  climates: Climate[];
  roomPref: RoomPref;
  diets: Diet[];
  accessibility: string;
  // Notifications & privacy
  emailUpdates: boolean;
  smsAlerts: boolean;
  marketing: boolean;
  twoFactor: boolean;
}

export const defaultProfile: ProfileData = {
  phone: "",
  dob: "",
  street: "",
  city: "",
  country: "",
  language: "English",
  currency: "USD",
  climates: [],
  roomPref: "Standard",
  diets: [],
  accessibility: "",
  emailUpdates: true,
  smsAlerts: false,
  marketing: false,
  twoFactor: false,
}; 

function writeLocal(data: ProfileData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(EVENT));
}

async function hydrate() {
  if (!apiEnabled()) return;
  try {
    const dto = await profileApi.get();
    writeLocal({ ...defaultProfile, ...(dto as unknown as Partial<ProfileData>) });
  } catch {
    /* keep cache */
  }
}

export const profileStore = {
  get(): ProfileData {
    if (typeof window === "undefined") return defaultProfile;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaultProfile, ...(JSON.parse(raw) as Partial<ProfileData>) } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  },
  save(data: ProfileData) {
    writeLocal(data);
    if (apiEnabled()) {
      profileApi.update(data as unknown as Partial<ProfilePreferencesDTO>).catch(() => {});
    }
  },
  hydrate,
  subscribe(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    void hydrate();
    window.addEventListener(EVENT, cb);
    return () => window.removeEventListener(EVENT, cb);
  },
};

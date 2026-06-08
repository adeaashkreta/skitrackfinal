import axios from "axios";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("skitrack_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Returns true when the app should try to talk to the backend.
 * Stores use this to decide whether to hydrate from / write through to the API,
 * vs. fall back to their localStorage / in-memory demo path.
 *
 * Conditions:
 *  - VITE_API_URL must be explicitly set (defaulting to localhost:5000 is fine)
 *  - A JWT must be present (otherwise calls 401 immediately)
 */
export function apiEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const url =
    (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "";
  if (!url) return false;
  return Boolean(localStorage.getItem("skitrack_token"));
}

// ---------- Auth ----------
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.put("/auth/me", data).then((r) => r.data),
};

// ---------- Resorts ----------
export const resortsApi = {
  list: (params?: { mine?: boolean }) =>
    api.get("/resorts", { params }).then((r) => r.data),
  get: (id: string) => api.get(`/resorts/${id}`).then((r) => r.data),
  create: (data: ResortInput) => api.post("/resorts", data).then((r) => r.data),
  update: (id: string, data: ResortInput) =>
    api.put(`/resorts/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/resorts/${id}`).then((r) => r.data),
};

// ---------- Bookings ----------
export const bookingsApi = {
  create: (data: {
    resortId: string;
    startDate: string;
    endDate: string;
    guests: number;
    totalPrice: number;
  }) => api.post("/bookings", data).then((r) => r.data),
  my: () => api.get("/bookings/my").then((r) => r.data),
  all: () => api.get("/bookings").then((r) => r.data),
  forManager: () => api.get("/bookings/manager").then((r) => r.data),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`).then((r) => r.data),
  confirm: (id: string) => api.put(`/bookings/${id}/confirm`).then((r) => r.data),
  remove: (id: string) => api.delete(`/bookings/${id}`).then((r) => r.data),
};

// ---------- Tickets ----------
export const ticketsApi = {
  myList: (): Promise<Ticket[]> => api.get("/tickets/my").then((r) => r.data),
  listForManager: (): Promise<Ticket[]> => api.get("/tickets/manager").then((r) => r.data),
  listAll: (): Promise<Ticket[]> => api.get("/tickets").then((r) => r.data),
  create: (data: { subject: string; body: string; resortId?: string }): Promise<Ticket> =>
    api.post("/tickets", data).then((r) => r.data),
  reply: (id: string, body: string): Promise<Ticket> =>
    api.post(`/tickets/${id}/reply`, { body }).then((r) => r.data),
  setStatus: (id: string, status: TicketStatus): Promise<Ticket> =>
    api.put(`/tickets/${id}/status`, { status }).then((r) => r.data),
};

// ---------- Favorites ----------
export interface FavoriteDTO {
  _id: string;
  userId: string;
  resortId: string;
  createdAt: string;
}
export const favoritesApi = {
  list: (): Promise<FavoriteDTO[]> => api.get("/favorites").then((r) => r.data),
  add: (resortId: string): Promise<FavoriteDTO> =>
    api.post("/favorites", { resortId }).then((r) => r.data),
  remove: (resortId: string): Promise<{ ok: true }> =>
    api.delete(`/favorites/${resortId}`).then((r) => r.data),
};

// ---------- Payment methods (masked metadata only) ----------
export interface SavedCardDTO {
  _id: string;
  brand: "Visa" | "Mastercard" | "Amex" | "Discover" | "Card";
  last4: string;
  expMonth: number;
  expYear: number;
  holder: string;
  isDefault: boolean;
  createdAt: string;
}
export const paymentsApi = {
  list: (): Promise<SavedCardDTO[]> => api.get("/payment-methods").then((r) => r.data),
  create: (data: {
    brand: SavedCardDTO["brand"];
    last4: string;
    expMonth: number;
    expYear: number;
    holder: string;
  }): Promise<SavedCardDTO> => api.post("/payment-methods", data).then((r) => r.data),
  remove: (id: string): Promise<{ ok: true }> =>
    api.delete(`/payment-methods/${id}`).then((r) => r.data),
  setDefault: (id: string): Promise<SavedCardDTO> =>
    api.put(`/payment-methods/${id}/default`, {}).then((r) => r.data),
};

// ---------- Profile preferences ----------
export interface ProfilePreferencesDTO {
  phone: string;
  dob: string;
  street: string;
  city: string;
  country: string;
  language: string;
  currency: string;
  climates: string[];
  roomPref: string;
  diets: string[];
  accessibility: string;
  emailUpdates: boolean;
  smsAlerts: boolean;
  marketing: boolean;
  twoFactor: boolean;
}
export const profileApi = {
  get: (): Promise<ProfilePreferencesDTO> => api.get("/profile").then((r) => r.data),
  update: (data: Partial<ProfilePreferencesDTO>): Promise<ProfilePreferencesDTO> =>
    api.put("/profile", data).then((r) => r.data),
};

// ---------- Admin ----------
export const adminApi = {
  stats: () => api.get("/admin/stats").then((r) => r.data),
  users: () => api.get("/users").then((r) => r.data),
  updateUser: (id: string, data: { role?: Role; name?: string; email?: string }) =>
    api.put(`/users/${id}`, data).then((r) => r.data),
  deleteUser: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};

// ---------- Types ----------
export type Role = "user" | "resort_manager" | "super_admin";

export const isSuperAdmin = (u?: User | null) => u?.role === "super_admin";
export const isManager = (u?: User | null) => u?.role === "resort_manager";
export const canAccessAdmin = (u?: User | null) => u?.role === "super_admin";

export interface Resort {
  _id: string;
  name: string;
  location: string;
  description: string;
  pricePerDay: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  image: string;
  rating: number;
  managerId?: string;
  country?: string;
  tagline?: string;
  whyFeatured?: string;
  features?: string[];
  amenities?: Array<"wifi" | "spa" | "bathtub" | "hot-tub" | "sauna">;
  activities?: Array<"skiing" | "snowboarding" | "hiking" | "cycling">;
  maxGuests?: number;
  unavailableRanges?: Array<{ from: string; to: string }>;
  coordinates?: { lat: number; lon: number };
  address?: string;
  gallery?: string[];
  reviewScore?: number;
  reviewCount?: number;
  reviewLabel?: string;
  reviewQuote?: { text: string; author: string; country?: string };
  popularFacilities?: string[];
  roomTypes?: RoomType[];
}

export interface RoomType {
  id: string;
  name: string;
  beds: string;
  sizeM2?: number;
  view?: string;
  bathroom?: string;
  tv?: boolean;
  image?: string;
  capacity: number;
  pricePerNight: number;
  originalPrice?: number;
  discountPct?: number;
  left?: number;
  perks?: string[];
}

export type ResortInput = Omit<Resort, "_id">;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Booking {
  _id: string;
  user: User | string;
  resort: Resort | string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export type TicketStatus = "open" | "pending" | "closed";

export interface TicketMessage {
  author: string;
  authorRole: Role;
  body: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  userId: string;
  userName: string;
  resortId?: string;
  resortName?: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

// Saved-cards store. Masked metadata only (brand + last4 + expiry + holder).
// Never store real PANs or CVCs.
// API-first when `apiEnabled()` is true, otherwise localStorage demo mode.

import { apiEnabled, paymentsApi, type SavedCardDTO } from "./api";

const KEY = "skitrack_payments";
const EVENT = "payments:changed";

export type CardBrand = "Visa" | "Mastercard" | "Amex" | "Discover" | "Card";

export interface SavedCard {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  holder: string;
  isDefault: boolean;
}

function read(): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedCard[]) : [];
  } catch {
    return [];
  }
}

function write(cards: SavedCard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event(EVENT));
}

function fromDTO(d: SavedCardDTO): SavedCard {
  return {
    id: d._id,
    brand: d.brand,
    last4: d.last4,
    expMonth: d.expMonth,
    expYear: d.expYear,
    holder: d.holder,
    isDefault: d.isDefault,
  };
}

async function hydrate() {
  if (!apiEnabled()) return;
  try {
    const rows = await paymentsApi.list();
    write(rows.map(fromDTO));
  } catch {
    /* keep cache */
  }
}

export function detectBrand(num: string): CardBrand {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(011|5)/.test(n)) return "Discover";
  return "Card";
}

export const paymentsStore = {
  list(): SavedCard[] {
    return read();
  },
  add(card: Omit<SavedCard, "id" | "isDefault">): SavedCard {
    const cur = read();
    const created: SavedCard = {
      ...card,
      id: `c${Date.now()}`,
      isDefault: cur.length === 0,
    };
    write([...cur, created]);
    if (apiEnabled()) {
      paymentsApi
        .create({
          brand: card.brand,
          last4: card.last4,
          expMonth: card.expMonth,
          expYear: card.expYear,
          holder: card.holder,
        })
        .then((dto) => {
          // Swap the temp id for the server id
          const next = read().map((c) => (c.id === created.id ? fromDTO(dto) : c));
          write(next);
        })
        .catch(() => {
          /* keep optimistic entry */
        });
    }
    return created;
  },
  remove(id: string) {
    const cur = read().filter((c) => c.id !== id);
    if (cur.length && !cur.some((c) => c.isDefault)) cur[0].isDefault = true;
    write(cur);
    if (apiEnabled()) paymentsApi.remove(id).catch(() => {});
  },
  setDefault(id: string) {
    write(read().map((c) => ({ ...c, isDefault: c.id === id })));
    if (apiEnabled()) paymentsApi.setDefault(id).catch(() => {});
  },
  hydrate,
  subscribe(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    void hydrate();
    window.addEventListener(EVENT, cb);
    return () => window.removeEventListener(EVENT, cb);
  },
};

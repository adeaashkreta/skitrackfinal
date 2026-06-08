// Favorites store. API-first when `apiEnabled()` is true, otherwise localStorage.
// The public sync API (list/has/toggle/remove) is preserved so components don't change.
// In API mode, the local cache mirrors the server and is rehydrated on subscribe().

import { apiEnabled, favoritesApi } from "./api";

const KEY = "skitrack_favorites";
const EVENT = "favorites:changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

async function hydrate() {
  if (!apiEnabled()) return;
  try {
    const rows = await favoritesApi.list();
    write(rows.map((r) => r.resortId));
  } catch {
    /* keep cache */
  }
}

export const favoritesStore = {
  list(): string[] {
    return read();
  },
  has(id: string): boolean {
    return read().includes(id);
  },
  toggle(id: string): boolean {
    const cur = read();
    const isAdding = !cur.includes(id);
    const next = isAdding ? [...cur, id] : cur.filter((x) => x !== id);
    write(next);
    if (apiEnabled()) {
      const op = isAdding ? favoritesApi.add(id) : favoritesApi.remove(id);
      op.catch(() => {
        // rollback on failure
        write(cur);
      });
    }
    return isAdding;
  },
  remove(id: string): void {
    const cur = read();
    write(cur.filter((x) => x !== id));
    if (apiEnabled()) favoritesApi.remove(id).catch(() => write(cur));
  },
  hydrate,
  subscribe(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    void hydrate();
    window.addEventListener(EVENT, cb);
    return () => window.removeEventListener(EVENT, cb);
  },
};

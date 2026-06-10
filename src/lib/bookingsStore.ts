import {
  apiEnabled,
  bookingsApi,
  type Booking,
  type Resort,
} from "./api";
import { demoBookings, demoResorts } from "./demoData";

const KEY = "skitrack_bookings";
const EVENT = "bookings:changed";

function findDemoResort(id: string) {
  return demoResorts.find((r) => r._id === id);
}

function normalizeBooking(booking: Booking, fallbackResort?: Resort): Booking {
  if (typeof booking.resort === "object") return booking;

  const matchedResort = fallbackResort ?? findDemoResort(booking.resort);

  return {
    ...booking,
    resort: matchedResort ?? booking.resort,
  };
}

function read(): Booking[] {
  if (typeof window === "undefined") return demoBookings;

  try {
    const raw = localStorage.getItem(KEY);

    if (raw) {
      return (JSON.parse(raw) as Booking[]).map((b) => normalizeBooking(b));
    }

    localStorage.setItem(KEY, JSON.stringify(demoBookings));
    return demoBookings;
  } catch {
    return demoBookings;
  }
}

function write(bookings: Booking[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(KEY, JSON.stringify(bookings));
  window.dispatchEvent(new Event(EVENT));
}

async function hydrate() {
  if (!apiEnabled()) return;

  try {
    const rows = (await bookingsApi.my()) as Booking[];
    write(rows.map((b) => normalizeBooking(b)));
  } catch {
    // keep local demo/cache
  }
}

export const bookingsStore = {
  list(): Booking[] {
    return read();
  },

  add(data: {
    user?: Booking["user"];
    resort: Resort;
    startDate: string;
    endDate: string;
    guests: number;
    totalPrice: number;
    status?: Booking["status"];
  }): Booking {
    const cur = read();

    const created: Booking = {
      _id: `b${Date.now()}`,
      user: data.user ?? "u1",
      resort: data.resort,
      startDate: data.startDate,
      endDate: data.endDate,
      guests: data.guests,
      totalPrice: data.totalPrice,
      status: data.status ?? "confirmed",
      createdAt: new Date().toISOString(),
    };

    write([...cur, created]);

    if (apiEnabled()) {
      bookingsApi
        .create({
          resortId: data.resort._id,
          startDate: data.startDate,
          endDate: data.endDate,
          guests: data.guests,
          totalPrice: data.totalPrice,
        })
        .then(async (serverBooking: Booking) => {
          let finalBooking = normalizeBooking(serverBooking, data.resort);

          if (finalBooking.status !== "confirmed") {
            try {
              const confirmed = (await bookingsApi.confirm(finalBooking._id)) as Booking;
              finalBooking = normalizeBooking(confirmed, data.resort);
            } catch {
              finalBooking = {
                ...finalBooking,
                status: "confirmed",
              };
            }
          }

          const next = read().map((b) =>
            b._id === created._id ? finalBooking : b
          );

          write(next);
        })
        .catch(() => {
          // keep optimistic local booking
        });
    }

    return created;
  },

  cancel(id: string) {
    const next = read().map((b) =>
      b._id === id ? { ...b, status: "cancelled" as const } : b
    );

    write(next);

    if (apiEnabled()) {
      bookingsApi.cancel(id).catch(() => {});
    }
  },

  remove(id: string) {
    write(read().filter((b) => b._id !== id));

    if (apiEnabled()) {
      bookingsApi.remove(id).catch(() => {});
    }
  },

  reset() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  },

  hydrate,

  subscribe(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};

    void hydrate();
    window.addEventListener(EVENT, cb);

    return () => window.removeEventListener(EVENT, cb);
  },
};
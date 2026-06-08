// Ticket store used by user / manager / admin dashboards and ContactResortDialog.
// API-first when `apiEnabled()` is true, otherwise an in-memory demo seeded from demoData.

import { apiEnabled, ticketsApi, type Ticket, type TicketStatus, type User } from "./api";
import { demoTickets, demoResorts } from "./demoData";

let tickets: Ticket[] = [...demoTickets];

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tickets:changed"));
  }
}

function set(next: Ticket[]) {
  tickets = next;
  emit();
}

async function hydrate(role?: "user" | "manager" | "admin") {
  if (!apiEnabled()) return;
  try {
    const rows =
      role === "admin"
        ? await ticketsApi.listAll()
        : role === "manager"
          ? await ticketsApi.listForManager()
          : await ticketsApi.myList();
    // Merge by _id so multiple scopes can coexist in the same cache.
    const byId = new Map(tickets.map((t) => [t._id, t] as const));
    for (const t of rows) byId.set(t._id, t);
    set(Array.from(byId.values()));
  } catch {
    /* keep cache */
  }
}

export const ticketStore = {
  all(): Ticket[] {
    return tickets.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  forUser(userId: string): Ticket[] {
    return this.all().filter((t) => t.userId === userId);
  },
  forManager(managerId: string): Ticket[] {
    const myResortIds = new Set(
      demoResorts.filter((r) => r.managerId === managerId).map((r) => r._id),
    );
    return this.all().filter((t) => t.resortId && myResortIds.has(t.resortId));
  },
  create(input: {
    user: Pick<User, "_id" | "name">;
    subject: string;
    body: string;
    resortId?: string;
  }): Ticket {
    const resort = input.resortId ? demoResorts.find((r) => r._id === input.resortId) : undefined;
    const now = new Date().toISOString();
    const ticket: Ticket = {
      _id: `t${Date.now()}`,
      userId: input.user._id,
      userName: input.user.name,
      resortId: resort?._id ?? input.resortId,
      resortName: resort?.name,
      subject: input.subject,
      status: "open",
      messages: [
        { author: input.user.name, authorRole: "user", body: input.body, createdAt: now },
      ],
      createdAt: now,
      updatedAt: now,
    };
    set([ticket, ...tickets]);
    if (apiEnabled()) {
      ticketsApi
        .create({ subject: input.subject, body: input.body, resortId: input.resortId })
        .then((saved) => set(tickets.map((t) => (t._id === ticket._id ? saved : t))))
        .catch(() => {});
    }
    return ticket;
  },
  reply(id: string, author: Pick<User, "name" | "role">, body: string): Ticket | undefined {
    const now = new Date().toISOString();
    set(
      tickets.map((t) =>
        t._id === id
          ? {
              ...t,
              status: author.role === "user" ? "open" : "pending",
              updatedAt: now,
              messages: [
                ...t.messages,
                { author: author.name, authorRole: author.role, body, createdAt: now },
              ],
            }
          : t,
      ),
    );
    if (apiEnabled()) {
      ticketsApi
        .reply(id, body)
        .then((saved) => set(tickets.map((t) => (t._id === id ? saved : t))))
        .catch(() => {});
    }
    return tickets.find((t) => t._id === id);
  },
  setStatus(id: string, status: TicketStatus): void {
    const now = new Date().toISOString();
    set(tickets.map((t) => (t._id === id ? { ...t, status, updatedAt: now } : t)));
    if (apiEnabled()) {
      ticketsApi
        .setStatus(id, status)
        .then((saved) => set(tickets.map((t) => (t._id === id ? saved : t))))
        .catch(() => {});
    }
  },
  hydrate,
};

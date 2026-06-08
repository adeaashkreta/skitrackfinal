# Backend contract

The frontend (`src/lib/api.ts`) is an `axios` client that targets
`VITE_API_URL` (default `http://localhost:5000/api`) and sends a JWT as
`Authorization: Bearer <token>` (stored in `localStorage["skitrack_token"]`).

A ready-to-run reference implementation lives in [`/server`](./server/) —
Node.js + Express + Mongoose + TypeScript, with a seed script populated from
`src/lib/demoData.ts`.

## Quick start

```bash
cd server
cp .env.example .env       # set MONGODB_URI + JWT_SECRET
npm install
npm run seed               # optional — populate demo resorts/users
npm run dev                # http://localhost:5000
```

Then in the project root:

```bash
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
# restart the dev server
```

Demo credentials (after `npm run seed`, password `password123` for all):
- `alex@example.com` — user
- `manager@skitrack.com` — resort_manager (manages Zermatt / St. Moritz / Frostline)
- `admin@skitrack.com` — super_admin

## Routes

All payloads are JSON. All `_id` fields are Mongo ObjectId strings.
Auth-protected routes return `401` without a valid bearer token; role-gated
routes return `403`.

### Auth — `/auth`
| Method | Path        | Auth | Body / Response                                      |
| ------ | ----------- | ---- | ---------------------------------------------------- |
| POST   | `/register` | —    | `{name,email,password}` → `{token, user}`            |
| POST   | `/login`    | —    | `{email,password}` → `{token, user}`                 |
| GET    | `/me`       | ✓    | → `User`                                             |
| PUT    | `/me`       | ✓    | `{name?,email?,password?}` → `User`                  |

### Resorts — `/resorts`
| Method | Path     | Auth | Notes                                              |
| ------ | -------- | ---- | -------------------------------------------------- |
| GET    | `/`      | —    | `?mine=true` filters to caller's resorts (manager) |
| GET    | `/:id`   | —    | → `Resort`                                         |
| POST   | `/`      | manager / admin | Body = `ResortInput`                    |
| PUT    | `/:id`   | owning manager / admin | Body = `ResortInput`             |
| DELETE | `/:id`   | owning manager / admin |                                 |

### Bookings — `/bookings`
| Method | Path           | Auth | Notes                                |
| ------ | -------------- | ---- | ------------------------------------ |
| POST   | `/`            | user | `{resortId,startDate,endDate,guests,totalPrice}` |
| GET    | `/my`          | user | caller's bookings                    |
| GET    | `/`            | admin | all bookings                        |
| GET    | `/manager`     | manager | bookings on caller's resorts      |
| PUT    | `/:id/cancel`  | user / manager / admin |                     |
| PUT    | `/:id/confirm` | manager / admin |                            |
| DELETE | `/:id`         | admin |                                     |

### Tickets — `/tickets`
| Method | Path            | Auth | Notes                                          |
| ------ | --------------- | ---- | ---------------------------------------------- |
| GET    | `/my`           | user | tickets opened by caller                       |
| GET    | `/manager`      | manager | tickets on resorts caller manages           |
| GET    | `/`             | admin | all tickets                                   |
| POST   | `/`             | user | `{subject,body,resortId?}` → `Ticket`          |
| POST   | `/:id/reply`    | participant | `{body}` → `Ticket`                     |
| PUT    | `/:id/status`   | manager / admin | `{status}` → `Ticket`               |

### Favorites — `/favorites`
| Method | Path           | Auth | Notes                                  |
| ------ | -------------- | ---- | -------------------------------------- |
| GET    | `/`            | user | → `Favorite[]`                         |
| POST   | `/`            | user | `{resortId}` → `Favorite`              |
| DELETE | `/:resortId`   | user | → `{ok:true}`                          |

### Payment methods — `/payment-methods`
Stores **masked metadata only** (brand, last4, expiry, holder). Never accept
PANs or CVCs.

| Method | Path            | Auth | Notes                                          |
| ------ | --------------- | ---- | ---------------------------------------------- |
| GET    | `/`             | user | → `SavedCardDTO[]`                             |
| POST   | `/`             | user | `{brand,last4,expMonth,expYear,holder}`         |
| DELETE | `/:id`          | user | → `{ok:true}` (promotes another card to default) |
| PUT    | `/:id/default`  | user | → `SavedCardDTO`                               |

### Profile preferences — `/profile`
Travel preferences, notification toggles, etc. — see
`ProfilePreferencesDTO` in `src/lib/api.ts`.

| Method | Path | Auth | Notes                                |
| ------ | ---- | ---- | ------------------------------------ |
| GET    | `/`  | user | → `ProfilePreferencesDTO`            |
| PUT    | `/`  | user | partial update → full DTO            |

### Admin — `/admin`, `/users`
| Method | Path            | Auth  | Notes                              |
| ------ | --------------- | ----- | ---------------------------------- |
| GET    | `/admin/stats`  | admin | dashboard counters                 |
| GET    | `/users`        | admin | → `User[]`                         |
| PUT    | `/users/:id`    | admin | `{role?,name?,email?}` → `User`    |
| DELETE | `/users/:id`    | admin |                                    |

## Demo-mode fallback

When `VITE_API_URL` is unset OR no token is in `localStorage`,
`apiEnabled()` returns false and all stores
(`favoritesStore`, `paymentsStore`, `profileStore`, `ticketStore`) fall
back to localStorage / in-memory data seeded from `src/lib/demoData.ts`.
This keeps the frontend functional in demo mode without a backend running.

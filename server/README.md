# Skitrack backend

Standalone Express + MongoDB API for the Skitrack frontend.

## Run locally

```bash
cp .env.example .env       # fill MONGODB_URI + JWT_SECRET
npm install
npm run seed               # optional — populate demo data
npm run dev                # http://localhost:5000
```

Then in the project root set `VITE_API_URL=http://localhost:5000/api` and
restart the Vite dev server.

## Stack

- Express 4 + Mongoose 8
- TypeScript (ts-node-dev for dev hot reload)
- JWT auth (bcrypt-hashed passwords)
- Zod request validation
- Helmet + CORS + morgan

## Deploy

The server is a plain Node.js app — deploy to Render, Railway, Fly.io, a VPS,
etc. Build with `npm run build` then `npm start`. Set the env vars from
`.env.example` in the host's dashboard.

After deploying, set `VITE_API_URL` in your frontend environment to
`https://<your-backend>/api` and add the frontend origin to `CORS_ORIGIN`.

## Seeded accounts (password `123123123`)

| Email              | Role            |
| ------------------ | --------------- |
| `admin@joni.com`   | super_admin     |
| `manager@adea.com` | resort_manager  |

See the route table in [`../BACKEND.md`](../BACKEND.md).

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env, corsOrigins } from "./env";
import { connectDB } from "./db";
import { errorHandler } from "./middleware/error";

import authRoutes from "./routes/auth";
import resortRoutes from "./routes/resorts";
import bookingRoutes from "./routes/bookings";
import ticketRoutes from "./routes/tickets";
import userRoutes from "./routes/users";
import adminRoutes from "./routes/admin";
import favoriteRoutes from "./routes/favorites";
import paymentRoutes from "./routes/payments";
import profileRoutes from "./routes/profile";

async function main() {
  await connectDB();

  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/resorts", resortRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/payment-methods", paymentRoutes);
  app.use("/api/profile", profileRoutes);

  app.use(errorHandler);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[fatal]", err);
  process.exit(1);
});

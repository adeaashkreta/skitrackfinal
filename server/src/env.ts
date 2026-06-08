import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:8080"),
  NODE_ENV: z.string().default("development"),
});

export const env = Env.parse(process.env);

export const corsOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);

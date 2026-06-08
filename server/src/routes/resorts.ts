import { Router } from "express";
import { z } from "zod";
import { Resort, toResortDTO } from "../models/Resort";
import { requireAuth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", async (req, res) => {
  const mine = req.query.mine === "true";
  if (mine) {
    // mine=true requires auth; fall through if not provided
    const header = req.headers.authorization;
    if (!header) throw new HttpError(401, "Authentication required for ?mine=true");
  }
  const filter: Record<string, unknown> = {};
  if (mine) {
    // re-verify via requireAuth pipeline by manually decoding
    // simpler: require caller to attach auth and rely on jwt parse
    const jwt = await import("jsonwebtoken");
    const env = (await import("../env")).env;
    const token = req.headers.authorization!.replace("Bearer ", "");
    const decoded = jwt.default.verify(token, env.JWT_SECRET) as { _id: string };
    filter.managerId = decoded._id;
  }
  const rows = await Resort.find(filter).sort({ createdAt: -1 });
  res.json(rows.map(toResortDTO));
});

router.get("/:id", async (req, res) => {
  const r = await Resort.findById(req.params.id);
  if (!r) throw new HttpError(404, "Resort not found");
  res.json(toResortDTO(r));
});

const RoomTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  beds: z.string(),
  sizeM2: z.number().optional(),
  view: z.string().optional(),
  bathroom: z.string().optional(),
  tv: z.boolean().optional(),
  image: z.string().optional(),
  capacity: z.number(),
  pricePerNight: z.number(),
  originalPrice: z.number().optional(),
  discountPct: z.number().optional(),
  left: z.number().optional(),
  perks: z.array(z.string()).optional(),
});

const ResortInputSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  pricePerDay: z.number().nonnegative(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  image: z.string().url().or(z.string().min(1)),
  rating: z.number().min(0).max(5),
  managerId: z.string().optional(),
  country: z.string().optional(),
  tagline: z.string().optional(),
  whyFeatured: z.string().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.enum(["wifi", "spa", "bathtub", "hot-tub", "sauna"])).optional(),
  activities: z.array(z.enum(["skiing", "snowboarding", "hiking", "cycling"])).optional(),
  maxGuests: z.number().optional(),
  unavailableRanges: z.array(z.object({ from: z.string(), to: z.string() })).optional(),
  coordinates: z.object({ lat: z.number(), lon: z.number() }).optional(),
  address: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  reviewScore: z.number().optional(),
  reviewCount: z.number().optional(),
  reviewLabel: z.string().optional(),
  reviewQuote: z.object({ text: z.string(), author: z.string(), country: z.string().optional() }).optional(),
  popularFacilities: z.array(z.string()).optional(),
  roomTypes: z.array(RoomTypeSchema).optional(),
});

router.post(
  "/",
  requireAuth,
  requireRole("resort_manager", "super_admin"),
  validate(ResortInputSchema),
  async (req, res) => {
    const data = req.body as z.infer<typeof ResortInputSchema>;
    const managerId =
      req.user!.role === "super_admin" ? (data.managerId ?? req.user!._id) : req.user!._id;
    const r = await Resort.create({ ...data, managerId });
    res.status(201).json(toResortDTO(r));
  },
);

router.put(
  "/:id",
  requireAuth,
  requireRole("resort_manager", "super_admin"),
  validate(ResortInputSchema),
  async (req, res) => {
    const r = await Resort.findById(req.params.id);
    if (!r) throw new HttpError(404, "Resort not found");
    if (req.user!.role !== "super_admin" && String(r.managerId) !== req.user!._id) {
      throw new HttpError(403, "Not your resort");
    }
    Object.assign(r, req.body);
    await r.save();
    res.json(toResortDTO(r));
  },
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("resort_manager", "super_admin"),
  async (req, res) => {
    const r = await Resort.findById(req.params.id);
    if (!r) throw new HttpError(404, "Resort not found");
    if (req.user!.role !== "super_admin" && String(r.managerId) !== req.user!._id) {
      throw new HttpError(403, "Not your resort");
    }
    await r.deleteOne();
    res.json({ ok: true });
  },
);

export default router;

import { Router } from "express";
import { z } from "zod";
import { ProfilePrefs } from "../models/ProfilePrefs";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

function toDTO(p: any) {
  return {
    phone: p.phone,
    dob: p.dob,
    street: p.street,
    city: p.city,
    country: p.country,
    language: p.language,
    currency: p.currency,
    climates: p.climates,
    roomPref: p.roomPref,
    diets: p.diets,
    accessibility: p.accessibility,
    emailUpdates: p.emailUpdates,
    smsAlerts: p.smsAlerts,
    marketing: p.marketing,
    twoFactor: p.twoFactor,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const p =
    (await ProfilePrefs.findOne({ userId: req.user!._id })) ??
    (await ProfilePrefs.create({ userId: req.user!._id }));
  res.json(toDTO(p));
});

const UpdateSchema = z.object({
  phone: z.string().max(40).optional(),
  dob: z.string().max(20).optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  language: z.string().max(40).optional(),
  currency: z.string().max(10).optional(),
  climates: z.array(z.string()).optional(),
  roomPref: z.string().max(40).optional(),
  diets: z.array(z.string()).optional(),
  accessibility: z.string().max(500).optional(),
  emailUpdates: z.boolean().optional(),
  smsAlerts: z.boolean().optional(),
  marketing: z.boolean().optional(),
  twoFactor: z.boolean().optional(),
});

router.put("/", requireAuth, validate(UpdateSchema), async (req, res) => {
  const p = await ProfilePrefs.findOneAndUpdate(
    { userId: req.user!._id },
    { $set: req.body as z.infer<typeof UpdateSchema> },
    { upsert: true, new: true },
  );
  res.json(toDTO(p));
});

export default router;

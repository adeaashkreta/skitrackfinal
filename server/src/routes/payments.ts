import { Router } from "express";
import { z } from "zod";
import { PaymentMethod } from "../models/PaymentMethod";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { validate } from "../middleware/validate";

const router = Router();

function toDTO(c: any) {
  return {
    _id: String(c._id),
    brand: c.brand,
    last4: c.last4,
    expMonth: c.expMonth,
    expYear: c.expYear,
    holder: c.holder,
    isDefault: c.isDefault,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const rows = await PaymentMethod.find({ userId: req.user!._id }).sort({ createdAt: -1 });
  res.json(rows.map(toDTO));
});

const CreateSchema = z.object({
  brand: z.enum(["Visa", "Mastercard", "Amex", "Discover", "Card"]),
  last4: z.string().regex(/^\d{4}$/),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2024).max(2099),
  holder: z.string().min(1).max(120),
});

router.post("/", requireAuth, validate(CreateSchema), async (req, res) => {
  const count = await PaymentMethod.countDocuments({ userId: req.user!._id });
  const c = await PaymentMethod.create({
    ...(req.body as z.infer<typeof CreateSchema>),
    userId: req.user!._id,
    isDefault: count === 0,
  });
  res.status(201).json(toDTO(c));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const c = await PaymentMethod.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
  if (!c) throw new HttpError(404, "Card not found");
  if (c.isDefault) {
    // promote oldest remaining card to default
    const next = await PaymentMethod.findOne({ userId: req.user!._id }).sort({ createdAt: 1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
  res.json({ ok: true });
});

router.put("/:id/default", requireAuth, async (req, res) => {
  const c = await PaymentMethod.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!c) throw new HttpError(404, "Card not found");
  await PaymentMethod.updateMany({ userId: req.user!._id }, { isDefault: false });
  c.isDefault = true;
  await c.save();
  res.json(toDTO(c));
});

export default router;

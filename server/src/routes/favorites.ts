import { Router } from "express";
import { z } from "zod";
import { Favorite } from "../models/Favorite";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const rows = await Favorite.find({ userId: req.user!._id }).sort({ createdAt: -1 });
  res.json(
    rows.map((f) => ({
      _id: String(f._id),
      userId: String(f.userId),
      resortId: String(f.resortId),
      createdAt: f.createdAt.toISOString(),
    })),
  );
});

const AddSchema = z.object({ resortId: z.string().min(1) });

router.post("/", requireAuth, validate(AddSchema), async (req, res) => {
  const { resortId } = req.body as z.infer<typeof AddSchema>;
  const f = await Favorite.findOneAndUpdate(
    { userId: req.user!._id, resortId },
    { $setOnInsert: { userId: req.user!._id, resortId } },
    { upsert: true, new: true },
  );
  res.status(201).json({
    _id: String(f._id),
    userId: String(f.userId),
    resortId: String(f.resortId),
    createdAt: f.createdAt.toISOString(),
  });
});

router.delete("/:resortId", requireAuth, async (req, res) => {
  await Favorite.deleteOne({ userId: req.user!._id, resortId: req.params.resortId });
  res.json({ ok: true });
});

export default router;

import { Router } from "express";
import { z } from "zod";
import { User, toUserDTO } from "../models/User";
import { requireAuth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", requireAuth, requireRole("super_admin"), async (_req, res) => {
  const rows = await User.find().sort({ createdAt: -1 });
  res.json(rows.map(toUserDTO));
});

const UpdateSchema = z.object({
  role: z.enum(["user", "resort_manager", "super_admin"]).optional(),
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
});

router.put("/:id", requireAuth, requireRole("super_admin"), validate(UpdateSchema), async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw new HttpError(404, "User not found");
  Object.assign(u, req.body);
  await u.save();
  res.json(toUserDTO(u));
});

router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) throw new HttpError(404, "User not found");
  res.json({ ok: true });
});

export default router;

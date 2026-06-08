import { Router } from "express";
import { z } from "zod";
import { Booking } from "../models/Booking";
import { Resort } from "../models/Resort";
import { requireAuth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { validate } from "../middleware/validate";

const router = Router();

const CreateBookingSchema = z.object({
  resortId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  guests: z.number().int().min(1).max(50),
  totalPrice: z.number().nonnegative(),
});

router.post("/", requireAuth, validate(CreateBookingSchema), async (req, res) => {
  const data = req.body as z.infer<typeof CreateBookingSchema>;
  const b = await Booking.create({
    user: req.user!._id,
    resort: data.resortId,
    startDate: data.startDate,
    endDate: data.endDate,
    guests: data.guests,
    totalPrice: data.totalPrice,
    status: "pending",
  });
  const populated = await Booking.findById(b._id).populate("user").populate("resort");
  res.status(201).json(populated);
});

router.get("/my", requireAuth, async (req, res) => {
  const rows = await Booking.find({ user: req.user!._id })
    .populate("user")
    .populate("resort")
    .sort({ createdAt: -1 });
  res.json(rows);
});

router.get("/", requireAuth, requireRole("super_admin"), async (_req, res) => {
  const rows = await Booking.find().populate("user").populate("resort").sort({ createdAt: -1 });
  res.json(rows);
});

router.get("/manager", requireAuth, requireRole("resort_manager", "super_admin"), async (req, res) => {
  const myResorts = await Resort.find({ managerId: req.user!._id }, { _id: 1 });
  const ids = myResorts.map((r) => r._id);
  const rows = await Booking.find({ resort: { $in: ids } })
    .populate("user")
    .populate("resort")
    .sort({ createdAt: -1 });
  res.json(rows);
});

router.put("/:id/cancel", requireAuth, async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw new HttpError(404, "Booking not found");
  const isOwner = String(b.user) === req.user!._id;
  const isAdmin = req.user!.role === "super_admin";
  let isManager = false;
  if (req.user!.role === "resort_manager") {
    const r = await Resort.findById(b.resort);
    isManager = r ? String(r.managerId) === req.user!._id : false;
  }
  if (!isOwner && !isAdmin && !isManager) throw new HttpError(403, "Forbidden");
  b.status = "cancelled";
  await b.save();
  res.json(await Booking.findById(b._id).populate("user").populate("resort"));
});

router.put("/:id/confirm", requireAuth, requireRole("resort_manager", "super_admin"), async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw new HttpError(404, "Booking not found");
  if (req.user!.role === "resort_manager") {
    const r = await Resort.findById(b.resort);
    if (!r || String(r.managerId) !== req.user!._id) throw new HttpError(403, "Forbidden");
  }
  b.status = "confirmed";
  await b.save();
  res.json(await Booking.findById(b._id).populate("user").populate("resort"));
});

router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  const b = await Booking.findByIdAndDelete(req.params.id);
  if (!b) throw new HttpError(404, "Booking not found");
  res.json({ ok: true });
});

export default router;

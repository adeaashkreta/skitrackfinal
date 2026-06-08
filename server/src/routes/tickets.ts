import { Router } from "express";
import { z } from "zod";
import { Ticket, toTicketDTO } from "../models/Ticket";
import { Resort } from "../models/Resort";
import { requireAuth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/my", requireAuth, async (req, res) => {
  const rows = await Ticket.find({ userId: req.user!._id }).sort({ updatedAt: -1 });
  res.json(rows.map(toTicketDTO));
});

router.get("/manager", requireAuth, requireRole("resort_manager", "super_admin"), async (req, res) => {
  const myResorts = await Resort.find({ managerId: req.user!._id }, { _id: 1 });
  const ids = myResorts.map((r) => r._id);
  const rows = await Ticket.find({ resortId: { $in: ids } }).sort({ updatedAt: -1 });
  res.json(rows.map(toTicketDTO));
});

router.get("/", requireAuth, requireRole("super_admin"), async (_req, res) => {
  const rows = await Ticket.find().sort({ updatedAt: -1 });
  res.json(rows.map(toTicketDTO));
});

const CreateSchema = z.object({
  subject: z.string().min(3).max(120),
  body: z.string().min(10).max(2000),
  resortId: z.string().optional(),
});

router.post("/", requireAuth, validate(CreateSchema), async (req, res) => {
  const { subject, body, resortId } = req.body as z.infer<typeof CreateSchema>;
  let resortName: string | undefined;
  if (resortId) {
    const r = await Resort.findById(resortId);
    if (!r) throw new HttpError(404, "Resort not found");
    resortName = r.name;
  }
  const now = new Date().toISOString();
  const t = await Ticket.create({
    userId: req.user!._id,
    userName: req.user!.name,
    resortId,
    resortName,
    subject,
    status: "open",
    messages: [{ author: req.user!.name, authorRole: "user", body, createdAt: now }],
  });
  res.status(201).json(toTicketDTO(t));
});

const ReplySchema = z.object({ body: z.string().min(1).max(2000) });

router.post("/:id/reply", requireAuth, validate(ReplySchema), async (req, res) => {
  const t = await Ticket.findById(req.params.id);
  if (!t) throw new HttpError(404, "Ticket not found");
  // Authorize: ticket owner, the resort's manager, or admin
  const isOwner = String(t.userId) === req.user!._id;
  const isAdmin = req.user!.role === "super_admin";
  let isManager = false;
  if (req.user!.role === "resort_manager" && t.resortId) {
    const r = await Resort.findById(t.resortId);
    isManager = r ? String(r.managerId) === req.user!._id : false;
  }
  if (!isOwner && !isAdmin && !isManager) throw new HttpError(403, "Forbidden");

  const now = new Date().toISOString();
  t.messages.push({
    author: req.user!.name,
    authorRole: req.user!.role,
    body: (req.body as z.infer<typeof ReplySchema>).body,
    createdAt: now,
  });
  t.status = req.user!.role === "user" ? "open" : "pending";
  await t.save();
  res.json(toTicketDTO(t));
});

const StatusSchema = z.object({ status: z.enum(["open", "pending", "closed"]) });

router.put("/:id/status", requireAuth, requireRole("resort_manager", "super_admin"), validate(StatusSchema), async (req, res) => {
  const t = await Ticket.findById(req.params.id);
  if (!t) throw new HttpError(404, "Ticket not found");
  if (req.user!.role === "resort_manager" && t.resortId) {
    const r = await Resort.findById(t.resortId);
    if (!r || String(r.managerId) !== req.user!._id) throw new HttpError(403, "Forbidden");
  }
  t.status = (req.body as z.infer<typeof StatusSchema>).status;
  await t.save();
  res.json(toTicketDTO(t));
});

export default router;

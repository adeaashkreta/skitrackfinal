import { Router } from "express";
import { User } from "../models/User";
import { Resort } from "../models/Resort";
import { Booking } from "../models/Booking";
import { Ticket } from "../models/Ticket";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/stats", requireAuth, requireRole("super_admin"), async (_req, res) => {
  const [users, resorts, bookings, openTickets, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Resort.countDocuments(),
    Booking.countDocuments(),
    Ticket.countDocuments({ status: "open" }),
    Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "pending"] } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
  ]);
  res.json({
    users,
    resorts,
    bookings,
    openTickets,
    revenue: revenueAgg[0]?.total ?? 0,
  });
});

export default router;

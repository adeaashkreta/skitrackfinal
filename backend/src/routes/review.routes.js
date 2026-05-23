const express = require("express");
const controller = require("../controllers/review.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

const reviewAccess = [auth, requireRole("Admin", "Resort Manager", "User")];
const adminOnly = [auth, requireRole("Admin")];

// Reviews for one resort
router.get(
  "/resorts/:resortId/reviews",
  ...reviewAccess,
  controller.listReviewsByResort
);

router.post(
  "/resorts/:resortId/reviews",
  ...reviewAccess,
  controller.createReview
);

// Single review actions
router.put("/reviews/:id", ...reviewAccess, controller.updateReview);
router.delete("/reviews/:id", ...reviewAccess, controller.hideReview);

// Admin moderation
router.patch(
  "/reviews/:id/visibility",
  ...adminOnly,
  controller.updateReviewVisibility
);

module.exports = router;

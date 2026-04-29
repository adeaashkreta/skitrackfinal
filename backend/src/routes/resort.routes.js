const express = require("express");
const resortController = require("../controllers/resort.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  auth,
  requireRole("Admin", "Resort Manager", "User"),
  resortController.listResorts
);

router.get(
  "/:id",
  auth,
  requireRole("Admin", "Resort Manager", "User"),
  resortController.getResortById
);

router.post(
  "/",
  auth,
  requireRole("Admin", "Resort Manager"),
  resortController.createResort
);

router.put(
  "/:id",
  auth,
  requireRole("Admin", "Resort Manager"),
  resortController.updateResort
);

router.delete(
  "/:id",
  auth,
  requireRole("Admin"),
  resortController.deleteResort
);

module.exports = router;
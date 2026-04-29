const express = require("express");
const controller = require("../controllers/resort-manager.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  auth,
  requireRole("Admin", "Resort Manager"),
  controller.listResortManagers
);

router.get(
  "/:id",
  auth,
  requireRole("Admin", "Resort Manager"),
  controller.getResortManagerById
);

router.post(
  "/",
  auth,
  requireRole("Admin"),
  controller.createResortManager
);

router.put(
  "/:id",
  auth,
  requireRole("Admin"),
  controller.updateResortManager
);

router.delete(
  "/:id",
  auth,
  requireRole("Admin"),
  controller.deactivateResortManager
);

module.exports = router;
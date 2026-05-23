const express = require("express");
const controller = require("../controllers/service.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

const readAccess = [auth, requireRole("Admin", "Resort Manager", "User")];
const manageAccess = [auth, requireRole("Admin", "Resort Manager")];
const adminOnly = [auth, requireRole("Admin")];

// Service types
router.get("/service-types", ...readAccess, controller.listServiceTypes);
router.get("/service-types/:id", ...readAccess, controller.getServiceTypeById);
router.post("/service-types", ...manageAccess, controller.createServiceType);
router.put("/service-types/:id", ...manageAccess, controller.updateServiceType);
router.delete("/service-types/:id", ...adminOnly, controller.deleteServiceType);

// Resort services
router.get("/resort-services", ...readAccess, controller.listResortServices);
router.get("/resort-services/:id", ...readAccess, controller.getResortServiceById);

router.get(
  "/resorts/:resortId/services",
  ...readAccess,
  controller.listServicesByResort
);

router.post(
  "/resorts/:resortId/services",
  ...manageAccess,
  controller.createResortService
);

router.put(
  "/resort-services/:id",
  ...manageAccess,
  controller.updateResortService
);

router.patch(
  "/resort-services/:id/availability",
  ...manageAccess,
  controller.updateResortServiceAvailability
);

router.delete(
  "/resort-services/:id",
  ...manageAccess,
  controller.deleteResortService
);

module.exports = router;

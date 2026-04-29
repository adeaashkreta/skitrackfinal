const express = require("express");
const controller = require("../controllers/facility.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

const readAccess = [auth, requireRole("Admin", "Resort Manager", "User")];
const manageAccess = [auth, requireRole("Admin", "Resort Manager")];
const adminOnly = [auth, requireRole("Admin")];

// Facilities
router.get("/facilities", ...readAccess, controller.listFacilities);
router.get("/facilities/:id", ...readAccess, controller.getFacilityById);
router.post("/facilities", ...manageAccess, controller.createFacility);
router.put("/facilities/:id", ...manageAccess, controller.updateFacility);
router.delete("/facilities/:id", ...adminOnly, controller.deleteFacility);

// Resort facilities
router.get(
  "/resorts/:resortId/facilities",
  ...readAccess,
  controller.listFacilitiesByResort
);

router.post(
  "/resorts/:resortId/facilities",
  ...manageAccess,
  controller.attachFacilityToResort
);

router.delete(
  "/resorts/:resortId/facilities/:facilityId",
  ...manageAccess,
  controller.removeFacilityFromResort
);

module.exports = router;
const express = require("express");
const controller = require("../controllers/favorite.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

const favoriteAccess = [auth, requireRole("Admin", "Resort Manager", "User")];

// Favorites - current logged-in user
router.get("/favorites/my", ...favoriteAccess, controller.listMyFavorites);
router.post("/favorites", ...favoriteAccess, controller.addFavorite);
router.delete(
  "/favorites/:resortId",
  ...favoriteAccess,
  controller.removeFavorite
);

module.exports = router;

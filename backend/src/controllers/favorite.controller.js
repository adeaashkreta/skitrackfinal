const favoriteService = require("../services/favorite.service");

const handleError = (res, error) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Resort is already in favorites",
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Invalid user_id or resort_id",
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

const listMyFavorites = async (req, res) => {
  try {
    const result = await favoriteService.listMyFavorites(req.user, req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const addFavorite = async (req, res) => {
  try {
    const favorite = await favoriteService.addFavorite(
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Resort added to favorites successfully",
      data: favorite,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const removeFavorite = async (req, res) => {
  try {
    await favoriteService.removeFavorite(
      req.params.resortId,
      req.user,
      req.ip
    );

    return res.json({
      message: "Resort removed from favorites successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listMyFavorites,
  addFavorite,
  removeFavorite,
};

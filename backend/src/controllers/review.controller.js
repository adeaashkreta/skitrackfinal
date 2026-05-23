const reviewService = require("../services/review.service");

const handleError = (res, error) => {
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Invalid user_id or resort_id",
    });
  }

  if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED" || error.errno === 3819) {
    return res.status(400).json({
      message: "rating must be between 1 and 5",
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

const listReviewsByResort = async (req, res) => {
  try {
    const result = await reviewService.listReviewsByResort(
      req.params.resortId,
      req.user,
      req.query
    );

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(
      req.params.resortId,
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const hideReview = async (req, res) => {
  try {
    await reviewService.hideReview(req.params.id, req.user, req.ip);

    return res.json({
      message: "Review hidden successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateReviewVisibility = async (req, res) => {
  try {
    const review = await reviewService.updateReviewVisibility(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Review visibility updated successfully",
      data: review,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listReviewsByResort,
  createReview,
  updateReview,
  hideReview,
  updateReviewVisibility,
};

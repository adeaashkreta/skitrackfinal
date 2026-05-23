const repo = require("../repositories/review.repository");

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildPagination = (query = {}) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

const formatPaginated = (rows, total, page, limit, summary = null) => {
  const response = {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  if (summary) {
    response.summary = summary;
  }

  return response;
};

const hasRole = (user, roleName) => {
  const roles = user?.roles || [];
  return roles.some((role) => role.toLowerCase() === roleName.toLowerCase());
};

const toBooleanNumber = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return 1;
  }

  if (value === false || value === 0 || value === "0" || value === "false") {
    return 0;
  }

  return null;
};

const validateRating = (value) => {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError("rating must be an integer between 1 and 5", 400);
  }

  return rating;
};

const audit = async ({ userId, action, entity, entityId, oldValue, newValue, ip }) => {
  await repo.createAuditLog({
    user_id: userId || null,
    action,
    entity,
    entity_id: entityId || null,
    old_value: oldValue ? JSON.stringify(oldValue) : null,
    new_value: newValue ? JSON.stringify(newValue) : null,
    ip_address: ip || null,
  });
};

const listReviewsByResort = async (resortIdParam, currentUser, query = {}) => {
  const resortId = Number(resortIdParam);

  if (!resortId) {
    throw createError("Invalid resortId", 400);
  }

  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  const { page, limit, offset } = buildPagination(query);
  const isAdmin = hasRole(currentUser, "Admin");

  const result = await repo.listReviewsByResort({
    resort_id: resortId,
    q: query.q || "",
    rating: query.rating || "",
    include_hidden:
      isAdmin &&
      (query.include_hidden === "true" || query.include_hidden === "1"),
    page,
    limit,
    offset,
  });

  const summary = await repo.getReviewSummaryByResort(resortId);

  return formatPaginated(result.rows, result.total, page, limit, summary);
};

const createReview = async (resortIdParam, body = {}, currentUser, ip) => {
  const resortId = Number(resortIdParam);

  if (!resortId) {
    throw createError("Invalid resortId", 400);
  }

  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  if (body.rating === undefined || body.rating === null || body.rating === "") {
    throw createError("rating is required", 400);
  }

  const rating = validateRating(body.rating);
  const comment = body.comment ? String(body.comment).trim() : null;

  const id = await repo.createReview({
    user_id: currentUser.id,
    resort_id: resortId,
    rating,
    comment,
    is_visible: 1,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const review = await repo.findReviewById(id);

  await audit({
    userId: currentUser.id,
    action: "CREATE_REVIEW",
    entity: "reviews",
    entityId: id,
    newValue: review,
    ip,
  });

  return review;
};

const updateReview = async (idParam, body = {}, currentUser, ip) => {
  const id = Number(idParam);

  if (!id) {
    throw createError("Invalid review id", 400);
  }

  const existing = await repo.findReviewById(id);

  if (!existing) {
    throw createError("Review not found", 404);
  }

  const isAdmin = hasRole(currentUser, "Admin");
  const isOwner = Number(existing.user_id) === Number(currentUser.id);

  if (!isAdmin && !isOwner) {
    throw createError("You can update only your own review", 403);
  }

  const data = {};

  if (body.rating !== undefined) {
    data.rating = validateRating(body.rating);
  }

  if (body.comment !== undefined) {
    data.comment = body.comment ? String(body.comment).trim() : null;
  }

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updateReview(id, data);

  const updated = await repo.findReviewById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE_REVIEW",
    entity: "reviews",
    entityId: id,
    oldValue: existing,
    newValue: updated,
    ip,
  });

  return updated;
};

const hideReview = async (idParam, currentUser, ip) => {
  const id = Number(idParam);

  if (!id) {
    throw createError("Invalid review id", 400);
  }

  const existing = await repo.findReviewById(id);

  if (!existing) {
    throw createError("Review not found", 404);
  }

  const isAdmin = hasRole(currentUser, "Admin");
  const isOwner = Number(existing.user_id) === Number(currentUser.id);

  if (!isAdmin && !isOwner) {
    throw createError("You can hide only your own review", 403);
  }

  await repo.updateReview(id, {
    is_visible: 0,
    updated_by: currentUser.id,
  });

  await audit({
    userId: currentUser.id,
    action: "HIDE_REVIEW",
    entity: "reviews",
    entityId: id,
    oldValue: existing,
    newValue: { is_visible: false },
    ip,
  });
};

const updateReviewVisibility = async (idParam, body = {}, currentUser, ip) => {
  const id = Number(idParam);

  if (!id) {
    throw createError("Invalid review id", 400);
  }

  const existing = await repo.findReviewById(id);

  if (!existing) {
    throw createError("Review not found", 404);
  }

  if (body.is_visible === undefined) {
    throw createError("is_visible is required", 400);
  }

  const isVisible = toBooleanNumber(body.is_visible);

  if (isVisible === null) {
    throw createError("is_visible must be true or false", 400);
  }

  await repo.updateReview(id, {
    is_visible: isVisible,
    updated_by: currentUser.id,
  });

  const updated = await repo.findReviewById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE_REVIEW_VISIBILITY",
    entity: "reviews",
    entityId: id,
    oldValue: existing,
    newValue: updated,
    ip,
  });

  return updated;
};

module.exports = {
  listReviewsByResort,
  createReview,
  updateReview,
  hideReview,
  updateReviewVisibility,
};

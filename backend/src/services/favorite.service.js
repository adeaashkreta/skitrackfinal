const repo = require("../repositories/favorite.repository");

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

const formatPaginated = (rows, total, page, limit) => {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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

const listMyFavorites = async (currentUser, query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listFavoritesByUser({
    user_id: currentUser.id,
    q: query.q || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const addFavorite = async (body = {}, currentUser, ip) => {
  const resortId = Number(body.resort_id);

  if (!resortId) {
    throw createError("resort_id is required", 400);
  }

  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  const existing = await repo.findFavorite(currentUser.id, resortId);

  if (existing) {
    throw createError("Resort is already in favorites", 409);
  }

  const id = await repo.createFavorite({
    user_id: currentUser.id,
    resort_id: resortId,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const favorite = await repo.findFavoriteById(id);

  await audit({
    userId: currentUser.id,
    action: "ADD_FAVORITE",
    entity: "favorites",
    entityId: id,
    newValue: favorite,
    ip,
  });

  return favorite;
};

const removeFavorite = async (resortIdParam, currentUser, ip) => {
  const resortId = Number(resortIdParam);

  if (!resortId) {
    throw createError("Invalid resortId", 400);
  }

  const existing = await repo.findFavorite(currentUser.id, resortId);

  if (!existing) {
    throw createError("Favorite not found", 404);
  }

  await repo.deleteFavorite(currentUser.id, resortId);

  await audit({
    userId: currentUser.id,
    action: "REMOVE_FAVORITE",
    entity: "favorites",
    entityId: existing.id,
    oldValue: existing,
    ip,
  });
};

module.exports = {
  listMyFavorites,
  addFavorite,
  removeFavorite,
};

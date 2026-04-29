const repo = require("../repositories/resort-manager.repository");

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toBooleanNumber = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return 1;
  }

  if (value === false || value === 0 || value === "0" || value === "false") {
    return 0;
  }

  return value;
};

const listResortManagers = async (query = {}) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;

  const filters = {
    q: query.q || "",
    resort_id: query.resort_id || "",
    user_id: query.user_id || "",
    is_active: query.is_active,
    page,
    limit,
    offset,
  };

  const result = await repo.listResortManagers(filters);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

const getResortManagerById = async (id) => {
  const row = await repo.findResortManagerById(id);

  if (!row) {
    throw createError("Resort manager not found", 404);
  }

  return row;
};

const createResortManager = async (body = {}, currentUser, ip) => {
  const resortId = body.resort_id;
  const userId = body.user_id;

  if (!resortId) {
    throw createError("resort_id is required", 400);
  }

  if (!userId) {
    throw createError("user_id is required", 400);
  }

  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  const user = await repo.findUserById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  const id = await repo.createResortManager({
    resort_id: resortId,
    user_id: userId,
    is_active: body.is_active === undefined ? 1 : toBooleanNumber(body.is_active),
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const created = await getResortManagerById(id);

  await repo.createAuditLog({
    user_id: currentUser.id,
    action: "ASSIGN_MANAGER",
    entity: "resort_managers",
    entity_id: id,
    old_value: null,
    new_value: JSON.stringify(created),
    ip_address: ip || null,
  });

  return created;
};

const updateResortManager = async (id, body = {}, currentUser, ip) => {
  const existing = await repo.findResortManagerById(id);

  if (!existing) {
    throw createError("Resort manager not found", 404);
  }

  const data = {};

  if (body.is_active !== undefined) {
    data.is_active = toBooleanNumber(body.is_active);
  }

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updateResortManager(id, data);

  const updated = await getResortManagerById(id);

  await repo.createAuditLog({
    user_id: currentUser.id,
    action: "UPDATE",
    entity: "resort_managers",
    entity_id: id,
    old_value: JSON.stringify(existing),
    new_value: JSON.stringify(data),
    ip_address: ip || null,
  });

  return updated;
};

const deactivateResortManager = async (id, currentUser, ip) => {
  const existing = await repo.findResortManagerById(id);

  if (!existing) {
    throw createError("Resort manager not found", 404);
  }

  await repo.updateResortManager(id, {
    is_active: 0,
    updated_by: currentUser.id,
  });

  await repo.createAuditLog({
    user_id: currentUser.id,
    action: "DEACTIVATE",
    entity: "resort_managers",
    entity_id: id,
    old_value: JSON.stringify(existing),
    new_value: JSON.stringify({ is_active: false }),
    ip_address: ip || null,
  });
};

module.exports = {
  listResortManagers,
  getResortManagerById,
  createResortManager,
  updateResortManager,
  deactivateResortManager,
};
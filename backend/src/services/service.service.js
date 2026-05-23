const repo = require("../repositories/service.repository");

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

const normalizeBoolean = (value) => {
  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true"
  ) {
    return 1;
  }

  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    String(value).toLowerCase() === "false"
  ) {
    return 0;
  }

  return null;
};

const normalizeNullableText = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return String(value).trim();
};

const normalizePrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const price = Number(value);

  if (Number.isNaN(price) || price < 0) {
    throw createError("price must be a positive number", 400);
  }

  return price;
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

// ========================
// Service types
// ========================

const listServiceTypes = async (query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listServiceTypes({
    q: query.q || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const getServiceTypeById = async (id) => {
  const serviceType = await repo.findServiceTypeById(id);

  if (!serviceType) {
    throw createError("Service type not found", 404);
  }

  return serviceType;
};

const createServiceType = async (body = {}, currentUser, ip) => {
  const name = String(body.name || "").trim();
  const description = normalizeNullableText(body.description);

  if (!name) {
    throw createError("name is required", 400);
  }

  const id = await repo.createServiceType({
    name,
    description,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const serviceType = await getServiceTypeById(id);

  await audit({
    userId: currentUser.id,
    action: "CREATE",
    entity: "service_types",
    entityId: id,
    newValue: serviceType,
    ip,
  });

  return serviceType;
};

const updateServiceType = async (id, body = {}, currentUser, ip) => {
  const existing = await repo.findServiceTypeById(id);

  if (!existing) {
    throw createError("Service type not found", 404);
  }

  const data = {};

  if (body.name !== undefined) {
    data.name = String(body.name).trim();

    if (!data.name) {
      throw createError("name cannot be empty", 400);
    }
  }

  if (body.description !== undefined) {
    data.description = normalizeNullableText(body.description);
  }

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updateServiceType(id, data);

  const updated = await getServiceTypeById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "service_types",
    entityId: id,
    oldValue: existing,
    newValue: data,
    ip,
  });

  return updated;
};

const deleteServiceType = async (id, currentUser, ip) => {
  const existing = await repo.findServiceTypeById(id);

  if (!existing) {
    throw createError("Service type not found", 404);
  }

  await repo.deleteServiceType(id);

  await audit({
    userId: currentUser.id,
    action: "DELETE",
    entity: "service_types",
    entityId: id,
    oldValue: existing,
    ip,
  });
};

// ========================
// Resort services
// ========================

const listResortServices = async (query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listResortServices({
    q: query.q || "",
    resort_id: query.resort_id || "",
    service_type_id: query.service_type_id || "",
    is_available: query.is_available,
    min_price: query.min_price || "",
    max_price: query.max_price || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const getResortServiceById = async (id) => {
  const resortService = await repo.findResortServiceById(id);

  if (!resortService) {
    throw createError("Resort service not found", 404);
  }

  return resortService;
};

const listServicesByResort = async (resortId, query = {}) => {
  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listResortServices({
    q: query.q || "",
    resort_id: resortId,
    service_type_id: query.service_type_id || "",
    is_available: query.is_available,
    min_price: query.min_price || "",
    max_price: query.max_price || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const buildResortServiceData = async (body = {}, isUpdate = false) => {
  const data = {};

  if (!isUpdate || body.service_type_id !== undefined) {
    if (!body.service_type_id) {
      throw createError("service_type_id is required", 400);
    }

    const serviceType = await repo.findServiceTypeById(body.service_type_id);

    if (!serviceType) {
      throw createError("Service type not found", 404);
    }

    data.service_type_id = body.service_type_id;
  }

  if (!isUpdate || body.name !== undefined) {
    data.name = String(body.name || "").trim();

    if (!data.name) {
      throw createError("name is required", 400);
    }
  }

  if (body.description !== undefined) {
    data.description = normalizeNullableText(body.description);
  }

  if (!isUpdate || body.price !== undefined) {
    data.price = normalizePrice(body.price);
  }

  if (body.duration !== undefined) {
    data.duration = normalizeNullableText(body.duration);
  }

  if (body.is_available !== undefined) {
    const isAvailable = normalizeBoolean(body.is_available);

    if (isAvailable === null) {
      throw createError("is_available must be true or false", 400);
    }

    data.is_available = isAvailable;
  }

  return data;
};

const createResortService = async (resortId, body = {}, currentUser, ip) => {
  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  const data = await buildResortServiceData(body, false);

  data.resort_id = resortId;
  data.is_available = data.is_available === undefined ? 1 : data.is_available;
  data.created_by = currentUser.id;
  data.updated_by = currentUser.id;

  const id = await repo.createResortService(data);
  const resortService = await getResortServiceById(id);

  await audit({
    userId: currentUser.id,
    action: "CREATE",
    entity: "resort_services",
    entityId: id,
    newValue: resortService,
    ip,
  });

  return resortService;
};

const updateResortService = async (id, body = {}, currentUser, ip) => {
  const existing = await repo.findResortServiceById(id);

  if (!existing) {
    throw createError("Resort service not found", 404);
  }

  const data = await buildResortServiceData(body, true);

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updateResortService(id, data);

  const updated = await getResortServiceById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "resort_services",
    entityId: id,
    oldValue: existing,
    newValue: data,
    ip,
  });

  return updated;
};

const updateResortServiceAvailability = async (
  id,
  body = {},
  currentUser,
  ip
) => {
  const existing = await repo.findResortServiceById(id);

  if (!existing) {
    throw createError("Resort service not found", 404);
  }

  if (body.is_available === undefined) {
    throw createError("is_available is required", 400);
  }

  const isAvailable = normalizeBoolean(body.is_available);

  if (isAvailable === null) {
    throw createError("is_available must be true or false", 400);
  }

  const data = {
    is_available: isAvailable,
    updated_by: currentUser.id,
  };

  await repo.updateResortService(id, data);

  const updated = await getResortServiceById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE_AVAILABILITY",
    entity: "resort_services",
    entityId: id,
    oldValue: existing,
    newValue: data,
    ip,
  });

  return updated;
};

const deleteResortService = async (id, currentUser, ip) => {
  const existing = await repo.findResortServiceById(id);

  if (!existing) {
    throw createError("Resort service not found", 404);
  }

  await repo.deactivateResortService(id, currentUser.id);

  await audit({
    userId: currentUser.id,
    action: "DEACTIVATE",
    entity: "resort_services",
    entityId: id,
    oldValue: existing,
    newValue: { is_available: false },
    ip,
  });
};

module.exports = {
  listServiceTypes,
  getServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  listResortServices,
  getResortServiceById,
  listServicesByResort,
  createResortService,
  updateResortService,
  updateResortServiceAvailability,
  deleteResortService,
};

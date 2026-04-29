const resortRepository = require("../repositories/resort.repository");

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const allowedDifficultyLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "mixed",
];

const normalizeBoolean = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return 1;
  }

  if (value === false || value === 0 || value === "0" || value === "false") {
    return 0;
  }

  return value;
};

const normalizeNullableNumber = (value) => {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
};

const validateResortPayload = (data, isUpdate = false) => {
  if (!isUpdate) {
    if (!data.name) {
      throw createError("name is required", 400);
    }

    if (!data.country) {
      throw createError("country is required", 400);
    }

    if (!data.city) {
      throw createError("city is required", 400);
    }
  }

  if (
    data.difficulty_level &&
    !allowedDifficultyLevels.includes(data.difficulty_level)
  ) {
    throw createError(
      "difficulty_level must be beginner, intermediate, advanced or mixed",
      400
    );
  }
};

const buildResortData = (body = {}) => {
  const allowedFields = [
    "name",
    "country",
    "city",
    "address",
    "latitude",
    "longitude",
    "description",
    "difficulty_level",
    "is_active",
  ];

  const data = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }

  if (data.name !== undefined) data.name = String(data.name).trim();
  if (data.country !== undefined) data.country = String(data.country).trim();
  if (data.city !== undefined) data.city = String(data.city).trim();
  if (data.address !== undefined) data.address = String(data.address).trim();
  if (data.description !== undefined) {
    data.description = String(data.description).trim();
  }

  if (data.latitude !== undefined) {
    data.latitude = normalizeNullableNumber(data.latitude);
  }

  if (data.longitude !== undefined) {
    data.longitude = normalizeNullableNumber(data.longitude);
  }

  if (data.is_active !== undefined) {
    data.is_active = normalizeBoolean(data.is_active);
  }

  return data;
};

const listResorts = async (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;

  const allowedSortColumns = [
    "id",
    "name",
    "country",
    "city",
    "difficulty_level",
    "created_at",
    "updated_at",
  ];

  const sortBy = allowedSortColumns.includes(query.sortBy)
    ? query.sortBy
    : "created_at";

  const sortOrder =
    String(query.sortOrder || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

  const filters = {
    q: query.q || "",
    country: query.country || "",
    city: query.city || "",
    difficulty_level: query.difficulty_level || "",
    is_active: query.is_active,
    page,
    limit,
    offset,
    sortBy,
    sortOrder,
  };

  const result = await resortRepository.listResorts(filters);

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

const getResortById = async (id) => {
  const resort = await resortRepository.findResortById(id);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  return resort;
};

const createResort = async (body, user) => {
  const data = buildResortData(body);

  validateResortPayload(data, false);

  data.created_by = user.id;
  data.updated_by = user.id;

  const resortId = await resortRepository.createResort(data);

  await resortRepository.createAuditLog({
    user_id: user.id,
    action: "CREATE",
    entity: "resorts",
    entity_id: resortId,
    old_value: null,
    new_value: JSON.stringify(data),
    ip_address: null,
  });

  return getResortById(resortId);
};

const updateResort = async (id, body, user) => {
  const existingResort = await resortRepository.findResortById(id);

  if (!existingResort) {
    throw createError("Resort not found", 404);
  }

  const data = buildResortData(body);

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  validateResortPayload(data, true);

  data.updated_by = user.id;

  await resortRepository.updateResort(id, data);

  await resortRepository.createAuditLog({
    user_id: user.id,
    action: "UPDATE",
    entity: "resorts",
    entity_id: id,
    old_value: JSON.stringify(existingResort),
    new_value: JSON.stringify(data),
    ip_address: null,
  });

  return getResortById(id);
};

const deleteResort = async (id, user) => {
  const existingResort = await resortRepository.findResortById(id);

  if (!existingResort) {
    throw createError("Resort not found", 404);
  }

  await resortRepository.deactivateResort(id, user.id);

  await resortRepository.createAuditLog({
    user_id: user.id,
    action: "DEACTIVATE",
    entity: "resorts",
    entity_id: id,
    old_value: JSON.stringify(existingResort),
    new_value: JSON.stringify({ is_active: false }),
    ip_address: null,
  });

  return true;
};

module.exports = {
  listResorts,
  getResortById,
  createResort,
  updateResort,
  deleteResort,
};
const repo = require("../repositories/facility.repository");

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

const listFacilities = async (query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listFacilities({
    q: query.q || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const getFacilityById = async (id) => {
  const facility = await repo.findFacilityById(id);

  if (!facility) {
    throw createError("Facility not found", 404);
  }

  return facility;
};

const createFacility = async (body = {}, currentUser, ip) => {
  const name = String(body.name || "").trim();
  const description = body.description ? String(body.description).trim() : null;

  if (!name) {
    throw createError("name is required", 400);
  }

  const id = await repo.createFacility({
    name,
    description,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const facility = await getFacilityById(id);

  await audit({
    userId: currentUser.id,
    action: "CREATE",
    entity: "facilities",
    entityId: id,
    newValue: facility,
    ip,
  });

  return facility;
};

const updateFacility = async (id, body = {}, currentUser, ip) => {
  const existing = await repo.findFacilityById(id);

  if (!existing) {
    throw createError("Facility not found", 404);
  }

  const data = {};

  if (body.name !== undefined) {
    data.name = String(body.name).trim();

    if (!data.name) {
      throw createError("name cannot be empty", 400);
    }
  }

  if (body.description !== undefined) {
    data.description = body.description ? String(body.description).trim() : null;
  }

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updateFacility(id, data);

  const updated = await getFacilityById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "facilities",
    entityId: id,
    oldValue: existing,
    newValue: data,
    ip,
  });

  return updated;
};

const deleteFacility = async (id, currentUser, ip) => {
  const existing = await repo.findFacilityById(id);

  if (!existing) {
    throw createError("Facility not found", 404);
  }

  await repo.deleteFacility(id);

  await audit({
    userId: currentUser.id,
    action: "DELETE",
    entity: "facilities",
    entityId: id,
    oldValue: existing,
    ip,
  });
};

const listFacilitiesByResort = async (resortId, query = {}) => {
  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listFacilitiesByResort({
    resort_id: resortId,
    q: query.q || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const attachFacilityToResort = async (resortId, body = {}, currentUser, ip) => {
  const facilityId = body.facility_id;

  if (!facilityId) {
    throw createError("facility_id is required", 400);
  }

  const resort = await repo.findResortById(resortId);

  if (!resort) {
    throw createError("Resort not found", 404);
  }

  const facility = await repo.findFacilityById(facilityId);

  if (!facility) {
    throw createError("Facility not found", 404);
  }

  const id = await repo.attachFacilityToResort({
    resort_id: resortId,
    facility_id: facilityId,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const attached = await repo.findResortFacilityById(id);

  await audit({
    userId: currentUser.id,
    action: "ATTACH_FACILITY",
    entity: "resort_facilities",
    entityId: id,
    newValue: attached,
    ip,
  });

  return attached;
};

const removeFacilityFromResort = async (
  resortId,
  facilityId,
  currentUser,
  ip
) => {
  const existing = await repo.findResortFacility(resortId, facilityId);

  if (!existing) {
    throw createError("Resort facility relation not found", 404);
  }

  await repo.removeFacilityFromResort(resortId, facilityId);

  await audit({
    userId: currentUser.id,
    action: "REMOVE_FACILITY",
    entity: "resort_facilities",
    entityId: existing.id,
    oldValue: existing,
    ip,
  });
};

module.exports = {
  listFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  listFacilitiesByResort,
  attachFacilityToResort,
  removeFacilityFromResort,
};
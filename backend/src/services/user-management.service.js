const bcrypt = require("bcrypt");
const repo = require("../repositories/user-management.repository");

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const toBooleanNumber = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true") return 1;
  if (value === false || value === 0 || value === "0" || value === "false") return 0;
  return value;
};

const requireField = (data, field) => {
  if (
    data[field] === undefined ||
    data[field] === null ||
    String(data[field]).trim() === ""
  ) {
    throw createError(`${field} is required`, 400);
  }
};

const buildPagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
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

// USERS
const listUsers = async (query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const filters = {
    q: query.q || "",
    is_active: query.is_active,
    page,
    limit,
    offset,
  };

  const result = await repo.listUsers(filters);

  return formatPaginated(result.rows, result.total, page, limit);
};

const getUserById = async (id) => {
  const user = await repo.findUserById(id);

  if (!user) {
    throw createError("User not found", 404);
  }

  return user;
};

const createUser = async (body = {}, currentUser, ip) => {
  const firstName = String(body.first_name || "").trim();
  const lastName = String(body.last_name || "").trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  requireField({ first_name: firstName }, "first_name");
  requireField({ last_name: lastName }, "last_name");
  requireField({ email }, "email");
  requireField({ password }, "password");

  if (password.length < 6) {
    throw createError("Password must be at least 6 characters", 400);
  }

  const existing = await repo.findUserByEmail(email);

  if (existing) {
    throw createError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userId = await repo.createUser({
    first_name: firstName,
    last_name: lastName,
    email,
    password_hash: passwordHash,
    is_active: body.is_active === undefined ? 1 : toBooleanNumber(body.is_active),
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const user = await getUserById(userId);

  await audit({
    userId: currentUser.id,
    action: "CREATE",
    entity: "users",
    entityId: userId,
    newValue: { email },
    ip,
  });

  return user;
};

const updateUser = async (id, body = {}, currentUser, ip) => {
  const existing = await repo.findUserById(id);

  if (!existing) {
    throw createError("User not found", 404);
  }

  const data = {};

  if (body.first_name !== undefined) {
    data.first_name = String(body.first_name).trim();
  }

  if (body.last_name !== undefined) {
    data.last_name = String(body.last_name).trim();
  }

  if (body.email !== undefined) {
    const email = normalizeEmail(body.email);

    const userWithEmail = await repo.findUserByEmail(email);

    if (userWithEmail && Number(userWithEmail.id) !== Number(id)) {
      throw createError("Email already exists", 409);
    }

    data.email = email;
  }

  if (body.is_active !== undefined) {
    data.is_active = toBooleanNumber(body.is_active);
  }

  if (body.password !== undefined && String(body.password).trim() !== "") {
    if (String(body.password).length < 6) {
      throw createError("Password must be at least 6 characters", 400);
    }

    data.password_hash = await bcrypt.hash(String(body.password), 10);
  }

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updateUser(id, data);

  const updated = await getUserById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "users",
    entityId: id,
    oldValue: existing,
    newValue: data,
    ip,
  });

  return updated;
};

const deactivateUser = async (id, currentUser, ip) => {
  if (Number(id) === Number(currentUser.id)) {
    throw createError("You cannot deactivate your own account", 400);
  }

  const existing = await repo.findUserById(id);

  if (!existing) {
    throw createError("User not found", 404);
  }

  await repo.updateUser(id, {
    is_active: 0,
    updated_by: currentUser.id,
  });

  await audit({
    userId: currentUser.id,
    action: "DEACTIVATE",
    entity: "users",
    entityId: id,
    oldValue: existing,
    newValue: { is_active: false },
    ip,
  });
};

const getUserRoles = async (userId) => {
  const user = await repo.findUserById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return repo.getUserRolesDetailed(userId);
};

const assignRoleToUser = async (userId, body = {}, currentUser, ip) => {
  const roleId = body.role_id;

  requireField({ role_id: roleId }, "role_id");

  const user = await repo.findUserById(userId);
  if (!user) throw createError("User not found", 404);

  const role = await repo.findRoleById(roleId);
  if (!role) throw createError("Role not found", 404);

  const id = await repo.assignRoleToUser({
    user_id: userId,
    role_id: roleId,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  await audit({
    userId: currentUser.id,
    action: "ASSIGN_ROLE",
    entity: "user_roles",
    entityId: id,
    newValue: { user_id: userId, role_id: roleId },
    ip,
  });

  return {
    id,
    user_id: Number(userId),
    role_id: Number(roleId),
    role_name: role.name,
  };
};

const removeRoleFromUser = async (userId, roleId, currentUser, ip) => {
  if (Number(userId) === Number(currentUser.id)) {
    const role = await repo.findRoleById(roleId);

    if (role && role.name === "Admin") {
      throw createError("You cannot remove Admin role from yourself", 400);
    }
  }

  const removed = await repo.removeRoleFromUser(userId, roleId);

  if (!removed) {
    throw createError("User role not found", 404);
  }

  await audit({
    userId: currentUser.id,
    action: "REMOVE_ROLE",
    entity: "user_roles",
    entityId: null,
    oldValue: { user_id: userId, role_id: roleId },
    ip,
  });
};

// ROLES
const listRoles = async (query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listRoles({
    q: query.q || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const getRoleById = async (id) => {
  const role = await repo.findRoleById(id);

  if (!role) {
    throw createError("Role not found", 404);
  }

  return role;
};

const createRole = async (body = {}, currentUser, ip) => {
  const name = String(body.name || "").trim();
  const description = body.description || null;

  requireField({ name }, "name");

  const id = await repo.createRole({
    name,
    description,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const role = await getRoleById(id);

  await audit({
    userId: currentUser.id,
    action: "CREATE",
    entity: "roles",
    entityId: id,
    newValue: role,
    ip,
  });

  return role;
};

const updateRole = async (id, body = {}, currentUser, ip) => {
  const existing = await repo.findRoleById(id);

  if (!existing) {
    throw createError("Role not found", 404);
  }

  const data = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.description !== undefined) data.description = body.description || null;

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updateRole(id, data);

  const updated = await getRoleById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "roles",
    entityId: id,
    oldValue: existing,
    newValue: data,
    ip,
  });

  return updated;
};

const deleteRole = async (id, currentUser, ip) => {
  const existing = await repo.findRoleById(id);

  if (!existing) {
    throw createError("Role not found", 404);
  }

  const protectedRoles = ["Admin", "User", "Resort Manager"];

  if (protectedRoles.includes(existing.name)) {
    throw createError("Built-in roles cannot be deleted", 400);
  }

  await repo.deleteRole(id);

  await audit({
    userId: currentUser.id,
    action: "DELETE",
    entity: "roles",
    entityId: id,
    oldValue: existing,
    ip,
  });
};

// PERMISSIONS
const listPermissions = async (query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listPermissions({
    q: query.q || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const getPermissionById = async (id) => {
  const permission = await repo.findPermissionById(id);

  if (!permission) {
    throw createError("Permission not found", 404);
  }

  return permission;
};

const createPermission = async (body = {}, currentUser, ip) => {
  const name = String(body.name || "").trim();
  const description = body.description || null;

  requireField({ name }, "name");

  const id = await repo.createPermission({
    name,
    description,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  const permission = await getPermissionById(id);

  await audit({
    userId: currentUser.id,
    action: "CREATE",
    entity: "permissions",
    entityId: id,
    newValue: permission,
    ip,
  });

  return permission;
};

const updatePermission = async (id, body = {}, currentUser, ip) => {
  const existing = await repo.findPermissionById(id);

  if (!existing) {
    throw createError("Permission not found", 404);
  }

  const data = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.description !== undefined) data.description = body.description || null;

  if (!Object.keys(data).length) {
    throw createError("No valid fields provided", 400);
  }

  data.updated_by = currentUser.id;

  await repo.updatePermission(id, data);

  const updated = await getPermissionById(id);

  await audit({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "permissions",
    entityId: id,
    oldValue: existing,
    newValue: data,
    ip,
  });

  return updated;
};

const deletePermission = async (id, currentUser, ip) => {
  const existing = await repo.findPermissionById(id);

  if (!existing) {
    throw createError("Permission not found", 404);
  }

  await repo.deletePermission(id);

  await audit({
    userId: currentUser.id,
    action: "DELETE",
    entity: "permissions",
    entityId: id,
    oldValue: existing,
    ip,
  });
};

// ROLE PERMISSIONS
const listRolePermissions = async (query = {}) => {
  const { page, limit, offset } = buildPagination(query);

  const result = await repo.listRolePermissions({
    role_id: query.role_id || "",
    permission_id: query.permission_id || "",
    page,
    limit,
    offset,
  });

  return formatPaginated(result.rows, result.total, page, limit);
};

const assignPermissionToRole = async (body = {}, currentUser, ip) => {
  const roleId = body.role_id;
  const permissionId = body.permission_id;

  requireField({ role_id: roleId }, "role_id");
  requireField({ permission_id: permissionId }, "permission_id");

  const role = await repo.findRoleById(roleId);
  if (!role) throw createError("Role not found", 404);

  const permission = await repo.findPermissionById(permissionId);
  if (!permission) throw createError("Permission not found", 404);

  const id = await repo.assignPermissionToRole({
    role_id: roleId,
    permission_id: permissionId,
    created_by: currentUser.id,
    updated_by: currentUser.id,
  });

  await audit({
    userId: currentUser.id,
    action: "ASSIGN_PERMISSION",
    entity: "role_permissions",
    entityId: id,
    newValue: { role_id: roleId, permission_id: permissionId },
    ip,
  });

  return {
    id,
    role_id: Number(roleId),
    role_name: role.name,
    permission_id: Number(permissionId),
    permission_name: permission.name,
  };
};

const removePermissionFromRole = async (id, currentUser, ip) => {
  const existing = await repo.findRolePermissionById(id);

  if (!existing) {
    throw createError("Role permission not found", 404);
  }

  await repo.deleteRolePermission(id);

  await audit({
    userId: currentUser.id,
    action: "REMOVE_PERMISSION",
    entity: "role_permissions",
    entityId: id,
    oldValue: existing,
    ip,
  });
};

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deactivateUser,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,

  listRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,

  listPermissions,
  createPermission,
  getPermissionById,
  updatePermission,
  deletePermission,

  listRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
};
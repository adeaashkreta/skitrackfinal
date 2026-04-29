const service = require("../services/user-management.service");

const handleError = (res, error) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Duplicate record",
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Invalid foreign key value",
    });
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      message: "Cannot delete this record because it is used by other records",
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

// Users
const listUsers = async (req, res) => {
  try {
    const result = await service.listUsers(req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const createUser = async (req, res) => {
  try {
    const user = await service.createUser(req.body, req.user, req.ip);

    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await service.getUserById(req.params.id);

    return res.json({
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await service.updateUser(req.params.id, req.body, req.user, req.ip);

    return res.json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deactivateUser = async (req, res) => {
  try {
    await service.deactivateUser(req.params.id, req.user, req.ip);

    return res.json({
      message: "User deactivated successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getUserRoles = async (req, res) => {
  try {
    const roles = await service.getUserRoles(req.params.id);

    return res.json({
      data: roles,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const assignRoleToUser = async (req, res) => {
  try {
    const result = await service.assignRoleToUser(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Role assigned to user successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const removeRoleFromUser = async (req, res) => {
  try {
    await service.removeRoleFromUser(
      req.params.id,
      req.params.roleId,
      req.user,
      req.ip
    );

    return res.json({
      message: "Role removed from user successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Roles
const listRoles = async (req, res) => {
  try {
    const result = await service.listRoles(req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const createRole = async (req, res) => {
  try {
    const role = await service.createRole(req.body, req.user, req.ip);

    return res.status(201).json({
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await service.getRoleById(req.params.id);

    return res.json({
      data: role,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await service.updateRole(req.params.id, req.body, req.user, req.ip);

    return res.json({
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteRole = async (req, res) => {
  try {
    await service.deleteRole(req.params.id, req.user, req.ip);

    return res.json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Permissions
const listPermissions = async (req, res) => {
  try {
    const result = await service.listPermissions(req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const createPermission = async (req, res) => {
  try {
    const permission = await service.createPermission(req.body, req.user, req.ip);

    return res.status(201).json({
      message: "Permission created successfully",
      data: permission,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getPermissionById = async (req, res) => {
  try {
    const permission = await service.getPermissionById(req.params.id);

    return res.json({
      data: permission,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updatePermission = async (req, res) => {
  try {
    const permission = await service.updatePermission(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Permission updated successfully",
      data: permission,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deletePermission = async (req, res) => {
  try {
    await service.deletePermission(req.params.id, req.user, req.ip);

    return res.json({
      message: "Permission deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Role permissions
const listRolePermissions = async (req, res) => {
  try {
    const result = await service.listRolePermissions(req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const assignPermissionToRole = async (req, res) => {
  try {
    const result = await service.assignPermissionToRole(
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Permission assigned to role successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const removePermissionFromRole = async (req, res) => {
  try {
    await service.removePermissionFromRole(req.params.id, req.user, req.ip);

    return res.json({
      message: "Permission removed from role successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
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
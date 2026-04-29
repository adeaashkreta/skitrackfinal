const express = require("express");
const controller = require("../controllers/user-management.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

const adminOnly = [auth, requireRole("Admin")];

// Users
router.get("/users", ...adminOnly, controller.listUsers);
router.post("/users", ...adminOnly, controller.createUser);
router.get("/users/:id", ...adminOnly, controller.getUserById);
router.put("/users/:id", ...adminOnly, controller.updateUser);
router.delete("/users/:id", ...adminOnly, controller.deactivateUser);

// User roles
router.get("/users/:id/roles", ...adminOnly, controller.getUserRoles);
router.post("/users/:id/roles", ...adminOnly, controller.assignRoleToUser);
router.delete(
  "/users/:id/roles/:roleId",
  ...adminOnly,
  controller.removeRoleFromUser
);

// Roles
router.get("/roles", ...adminOnly, controller.listRoles);
router.post("/roles", ...adminOnly, controller.createRole);
router.get("/roles/:id", ...adminOnly, controller.getRoleById);
router.put("/roles/:id", ...adminOnly, controller.updateRole);
router.delete("/roles/:id", ...adminOnly, controller.deleteRole);

// Permissions
router.get("/permissions", ...adminOnly, controller.listPermissions);
router.post("/permissions", ...adminOnly, controller.createPermission);
router.get("/permissions/:id", ...adminOnly, controller.getPermissionById);
router.put("/permissions/:id", ...adminOnly, controller.updatePermission);
router.delete("/permissions/:id", ...adminOnly, controller.deletePermission);

// Role permissions
router.get("/role-permissions", ...adminOnly, controller.listRolePermissions);
router.post("/role-permissions", ...adminOnly, controller.assignPermissionToRole);
router.delete(
  "/role-permissions/:id",
  ...adminOnly,
  controller.removePermissionFromRole
);

module.exports = router;
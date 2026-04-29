const { getMySQLPool } = require("../config/mysql");

const quote = (field) => `\`${String(field).replace(/`/g, "")}\``;

const buildSetSql = (data) => {
  const fields = Object.keys(data);
  const setSql = fields.map((field) => `${quote(field)} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  return { setSql, values };
};

const listUsers = async (filters) => {
  const pool = getMySQLPool();

  const where = [];
  const params = [];

  if (filters.q) {
    where.push(
      `(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`
    );

    const search = `%${filters.q}%`;
    params.push(search, search, search);
  }

  if (filters.is_active !== undefined && filters.is_active !== "") {
    where.push("u.is_active = ?");
    params.push(filters.is_active === "true" || filters.is_active === "1" ? 1 : 0);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.is_active,
      u.created_by,
      u.updated_by,
      u.created_at,
      u.updated_at,
      COALESCE(GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ','), '') AS roles_csv
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    ${whereSql}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM users u
    ${whereSql}
    `,
    params
  );

  return {
    rows: rows.map((row) => ({
      ...row,
      is_active: Boolean(row.is_active),
      roles: row.roles_csv ? row.roles_csv.split(",") : [],
      roles_csv: undefined,
    })),
    total: countRows[0].total,
  };
};

const findUserById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.is_active,
      u.created_by,
      u.updated_by,
      u.created_at,
      u.updated_at,
      COALESCE(GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ','), '') AS roles_csv
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    WHERE u.id = ?
    GROUP BY u.id
    LIMIT 1
    `,
    [id]
  );

  if (!rows.length) return null;

  const row = rows[0];

  return {
    ...row,
    is_active: Boolean(row.is_active),
    roles: row.roles_csv ? row.roles_csv.split(",") : [],
    roles_csv: undefined,
  };
};

const findUserByEmail = async (email) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT id, first_name, last_name, email, password_hash, is_active
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const createUser = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO users
      (
        first_name,
        last_name,
        email,
        password_hash,
        is_active,
        created_by,
        updated_by
      )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.password_hash,
      data.is_active,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const updateUser = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE users
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

const getUserRolesDetailed = async (userId) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      ur.id,
      ur.user_id,
      ur.role_id,
      r.name AS role_name,
      r.description AS role_description,
      ur.assigned_at,
      ur.created_at,
      ur.updated_at
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = ?
    ORDER BY r.name ASC
    `,
    [userId]
  );

  return rows;
};

const assignRoleToUser = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO user_roles
      (user_id, role_id, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [data.user_id, data.role_id, data.created_by, data.updated_by]
  );

  return result.insertId;
};

const removeRoleFromUser = async (userId, roleId) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM user_roles
    WHERE user_id = ?
      AND role_id = ?
    `,
    [userId, roleId]
  );

  return result.affectedRows > 0;
};

// Roles
const listRoles = async (filters) => {
  const pool = getMySQLPool();

  const where = [];
  const params = [];

  if (filters.q) {
    where.push("(name LIKE ? OR description LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT id, name, description, created_by, updated_by, created_at, updated_at
    FROM roles
    ${whereSql}
    ORDER BY name ASC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM roles
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const findRoleById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT id, name, description, created_by, updated_by, created_at, updated_at
    FROM roles
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createRole = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO roles
      (name, description, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [data.name, data.description, data.created_by, data.updated_by]
  );

  return result.insertId;
};

const updateRole = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE roles
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

const deleteRole = async (id) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM roles
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
};

// Permissions
const listPermissions = async (filters) => {
  const pool = getMySQLPool();

  const where = [];
  const params = [];

  if (filters.q) {
    where.push("(name LIKE ? OR description LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT id, name, description, created_by, updated_by, created_at, updated_at
    FROM permissions
    ${whereSql}
    ORDER BY name ASC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM permissions
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const findPermissionById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT id, name, description, created_by, updated_by, created_at, updated_at
    FROM permissions
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createPermission = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO permissions
      (name, description, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [data.name, data.description, data.created_by, data.updated_by]
  );

  return result.insertId;
};

const updatePermission = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE permissions
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

const deletePermission = async (id) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM permissions
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
};

// Role permissions
const listRolePermissions = async (filters) => {
  const pool = getMySQLPool();

  const where = [];
  const params = [];

  if (filters.role_id) {
    where.push("rp.role_id = ?");
    params.push(filters.role_id);
  }

  if (filters.permission_id) {
    where.push("rp.permission_id = ?");
    params.push(filters.permission_id);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT
      rp.id,
      rp.role_id,
      r.name AS role_name,
      rp.permission_id,
      p.name AS permission_name,
      p.description AS permission_description,
      rp.created_by,
      rp.updated_by,
      rp.created_at,
      rp.updated_at
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN permissions p ON p.id = rp.permission_id
    ${whereSql}
    ORDER BY r.name ASC, p.name ASC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM role_permissions rp
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const findRolePermissionById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      rp.id,
      rp.role_id,
      r.name AS role_name,
      rp.permission_id,
      p.name AS permission_name,
      rp.created_by,
      rp.updated_by,
      rp.created_at,
      rp.updated_at
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const assignPermissionToRole = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO role_permissions
      (role_id, permission_id, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [data.role_id, data.permission_id, data.created_by, data.updated_by]
  );

  return result.insertId;
};

const deleteRolePermission = async (id) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM role_permissions
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
};

// Audit
const createAuditLog = async (data) => {
  try {
    const pool = getMySQLPool();

    await pool.query(
      `
      INSERT INTO audit_logs
        (user_id, action, entity, entity_id, old_value, new_value, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.user_id || null,
        data.action,
        data.entity,
        data.entity_id || null,
        data.old_value || null,
        data.new_value || null,
        data.ip_address || null,
      ]
    );
  } catch {
    // Audit log nuk duhet me e rrëzu request-in kryesor.
  }
};

module.exports = {
  listUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  getUserRolesDetailed,
  assignRoleToUser,
  removeRoleFromUser,

  listRoles,
  findRoleById,
  createRole,
  updateRole,
  deleteRole,

  listPermissions,
  findPermissionById,
  createPermission,
  updatePermission,
  deletePermission,

  listRolePermissions,
  findRolePermissionById,
  assignPermissionToRole,
  deleteRolePermission,

  createAuditLog,
};
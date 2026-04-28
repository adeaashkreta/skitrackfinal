const { getMySQLPool } = require("../config/mysql");

const getExecutor = (connection) => {
  return connection || getMySQLPool();
};

const withTransaction = async (callback) => {
  const pool = getMySQLPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const findUserByEmail = async (email, connection = null) => {
  const db = getExecutor(connection);

  const [rows] = await db.query(
    `
    SELECT id, first_name, last_name, email, password_hash, is_active, created_at
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const findUserById = async (id, connection = null) => {
  const db = getExecutor(connection);

  const [rows] = await db.query(
    `
    SELECT id, first_name, last_name, email, is_active, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const getUserRoles = async (userId, connection = null) => {
  const db = getExecutor(connection);

  const [rows] = await db.query(
    `
    SELECT r.name
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = ?
    `,
    [userId]
  );

  return rows.map((row) => row.name);
};

const createUser = async (user, connection = null) => {
  const db = getExecutor(connection);

  const [result] = await db.query(
    `
    INSERT INTO users
      (first_name, last_name, email, password_hash)
    VALUES (?, ?, ?, ?)
    `,
    [user.first_name, user.last_name, user.email, user.password_hash]
  );

  return result.insertId;
};

const updateUserAuditFields = async (userId, connection = null) => {
  const db = getExecutor(connection);

  await db.query(
    `
    UPDATE users
    SET created_by = ?, updated_by = ?
    WHERE id = ?
    `,
    [userId, userId, userId]
  );
};

const findRoleByName = async (roleName, connection = null) => {
  const db = getExecutor(connection);

  const [rows] = await db.query(
    `
    SELECT id, name
    FROM roles
    WHERE name = ?
    LIMIT 1
    `,
    [roleName]
  );

  return rows[0] || null;
};

const assignRoleToUser = async (data, connection = null) => {
  const db = getExecutor(connection);

  await db.query(
    `
    INSERT INTO user_roles
      (user_id, role_id, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [data.user_id, data.role_id, data.created_by, data.updated_by]
  );
};

const createRefreshToken = async (data, connection = null) => {
  const db = getExecutor(connection);

  await db.query(
    `
    INSERT INTO refresh_tokens
      (user_id, token_hash, expires_at, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.user_id,
      data.token_hash,
      data.expires_at,
      data.created_by,
      data.updated_by,
    ]
  );
};

const findValidRefreshToken = async (tokenHash, connection = null) => {
  const db = getExecutor(connection);

  const [rows] = await db.query(
    `
    SELECT
      rt.id AS refresh_token_id,
      rt.user_id
    FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.token_hash = ?
      AND rt.revoked_at IS NULL
      AND rt.expires_at > NOW()
      AND u.is_active = TRUE
    LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};

const revokeRefreshToken = async (data, connection = null) => {
  const db = getExecutor(connection);

  await db.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW(), updated_by = ?
    WHERE id = ?
    `,
    [data.user_id, data.refresh_token_id]
  );
};

const revokeRefreshTokenByHash = async (tokenHash, connection = null) => {
  const db = getExecutor(connection);

  await db.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = ?
      AND revoked_at IS NULL
    `,
    [tokenHash]
  );
};

const createAuditLog = async (data, connection = null) => {
  try {
    const db = getExecutor(connection);

    await db.query(
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
    // Audit log nuk duhet me e ndal auth-in.
  }
};

module.exports = {
  withTransaction,
  findUserByEmail,
  findUserById,
  getUserRoles,
  createUser,
  updateUserAuditFields,
  findRoleByName,
  assignRoleToUser,
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokenByHash,
  createAuditLog,
};
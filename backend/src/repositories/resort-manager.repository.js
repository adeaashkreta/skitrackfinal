const { getMySQLPool } = require("../config/mysql");

const buildSetSql = (data) => {
  const fields = Object.keys(data);
  const setSql = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  return {
    setSql,
    values,
  };
};

const listResortManagers = async (filters) => {
  const pool = getMySQLPool();

  const where = [];
  const params = [];

  if (filters.q) {
    where.push(
      `(r.name LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`
    );

    const search = `%${filters.q}%`;
    params.push(search, search, search, search);
  }

  if (filters.resort_id) {
    where.push("rm.resort_id = ?");
    params.push(filters.resort_id);
  }

  if (filters.user_id) {
    where.push("rm.user_id = ?");
    params.push(filters.user_id);
  }

  if (filters.is_active !== undefined && filters.is_active !== "") {
    where.push("rm.is_active = ?");
    params.push(filters.is_active === "true" || filters.is_active === "1" ? 1 : 0);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT
      rm.id,
      rm.resort_id,
      r.name AS resort_name,
      rm.user_id,
      u.first_name,
      u.last_name,
      u.email,
      rm.assigned_at,
      rm.is_active,
      rm.created_by,
      rm.updated_by,
      rm.created_at,
      rm.updated_at
    FROM resort_managers rm
    JOIN resorts r ON r.id = rm.resort_id
    JOIN users u ON u.id = rm.user_id
    ${whereSql}
    ORDER BY rm.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM resort_managers rm
    JOIN resorts r ON r.id = rm.resort_id
    JOIN users u ON u.id = rm.user_id
    ${whereSql}
    `,
    params
  );

  return {
    rows: rows.map((row) => ({
      ...row,
      is_active: Boolean(row.is_active),
    })),
    total: countRows[0].total,
  };
};

const findResortManagerById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      rm.id,
      rm.resort_id,
      r.name AS resort_name,
      rm.user_id,
      u.first_name,
      u.last_name,
      u.email,
      rm.assigned_at,
      rm.is_active,
      rm.created_by,
      rm.updated_by,
      rm.created_at,
      rm.updated_at
    FROM resort_managers rm
    JOIN resorts r ON r.id = rm.resort_id
    JOIN users u ON u.id = rm.user_id
    WHERE rm.id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!rows.length) return null;

  return {
    ...rows[0],
    is_active: Boolean(rows[0].is_active),
  };
};

const findResortById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT id, name, is_active
    FROM resorts
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const findUserById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT id, first_name, last_name, email, is_active
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createResortManager = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO resort_managers
      (
        resort_id,
        user_id,
        is_active,
        created_by,
        updated_by
      )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.resort_id,
      data.user_id,
      data.is_active,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const updateResortManager = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE resort_managers
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

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
    // Audit log nuk duhet me e rrëzu endpoint-in kryesor.
  }
};

module.exports = {
  listResortManagers,
  findResortManagerById,
  findResortById,
  findUserById,
  createResortManager,
  updateResortManager,
  createAuditLog,
};
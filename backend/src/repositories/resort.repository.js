const { getMySQLPool } = require("../config/mysql");

const buildWhereClause = (filters) => {
  const where = [];
  const params = [];

  if (filters.q) {
    where.push(
      `(r.name LIKE ? OR r.country LIKE ? OR r.city LIKE ? OR r.description LIKE ?)`
    );

    const search = `%${filters.q}%`;
    params.push(search, search, search, search);
  }

  if (filters.country) {
    where.push("r.country = ?");
    params.push(filters.country);
  }

  if (filters.city) {
    where.push("r.city = ?");
    params.push(filters.city);
  }

  if (filters.difficulty_level) {
    where.push("r.difficulty_level = ?");
    params.push(filters.difficulty_level);
  }

  if (filters.is_active !== undefined && filters.is_active !== "") {
    where.push("r.is_active = ?");
    params.push(
      filters.is_active === "true" || filters.is_active === "1" ? 1 : 0
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  return {
    whereSql,
    params,
  };
};

const listResorts = async (filters) => {
  const pool = getMySQLPool();

  const { whereSql, params } = buildWhereClause(filters);

  const [rows] = await pool.query(
    `
    SELECT
      r.id,
      r.name,
      r.country,
      r.city,
      r.address,
      r.latitude,
      r.longitude,
      r.description,
      r.difficulty_level,
      r.is_active,
      r.created_by,
      r.updated_by,
      r.created_at,
      r.updated_at,
      COALESCE(AVG(rv.rating), 0) AS average_rating,
      COUNT(rv.id) AS review_count
    FROM resorts r
    LEFT JOIN reviews rv
      ON rv.resort_id = r.id
      AND rv.is_visible = TRUE
    ${whereSql}
    GROUP BY r.id
    ORDER BY r.${filters.sortBy} ${filters.sortOrder}
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM resorts r
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const findResortById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      r.id,
      r.name,
      r.country,
      r.city,
      r.address,
      r.latitude,
      r.longitude,
      r.description,
      r.difficulty_level,
      r.is_active,
      r.created_by,
      r.updated_by,
      r.created_at,
      r.updated_at,
      COALESCE(AVG(rv.rating), 0) AS average_rating,
      COUNT(rv.id) AS review_count
    FROM resorts r
    LEFT JOIN reviews rv
      ON rv.resort_id = r.id
      AND rv.is_visible = TRUE
    WHERE r.id = ?
    GROUP BY r.id
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createResort = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO resorts
      (
        name,
        country,
        city,
        address,
        latitude,
        longitude,
        description,
        difficulty_level,
        is_active,
        created_by,
        updated_by
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.name,
      data.country,
      data.city,
      data.address || null,
      data.latitude || null,
      data.longitude || null,
      data.description || null,
      data.difficulty_level || "mixed",
      data.is_active === undefined ? 1 : data.is_active,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const updateResort = async (id, data) => {
  const pool = getMySQLPool();

  const fields = Object.keys(data);

  const setSql = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  const [result] = await pool.query(
    `
    UPDATE resorts
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

const deactivateResort = async (id, userId) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    UPDATE resorts
    SET is_active = FALSE,
        updated_by = ?
    WHERE id = ?
    `,
    [userId, id]
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
  }
};

module.exports = {
  listResorts,
  findResortById,
  createResort,
  updateResort,
  deactivateResort,
  createAuditLog,
};
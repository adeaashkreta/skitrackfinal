const { getMySQLPool } = require("../config/mysql");

const listFavoritesByUser = async (filters) => {
  const pool = getMySQLPool();

  const where = ["f.user_id = ?"];
  const params = [filters.user_id];

  if (filters.q) {
    where.push(
      "(r.name LIKE ? OR r.country LIKE ? OR r.city LIKE ? OR r.description LIKE ?)"
    );

    const search = `%${filters.q}%`;
    params.push(search, search, search, search);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [rows] = await pool.query(
    `
    SELECT
      f.id AS favorite_id,
      f.user_id,
      f.resort_id,
      r.name AS resort_name,
      r.country,
      r.city,
      r.address,
      r.latitude,
      r.longitude,
      r.description,
      r.difficulty_level,
      r.is_active,
      COALESCE(AVG(rv.rating), 0) AS average_rating,
      COUNT(rv.id) AS review_count,
      f.created_at AS favorited_at,
      f.updated_at
    FROM favorites f
    JOIN resorts r ON r.id = f.resort_id
    LEFT JOIN reviews rv
      ON rv.resort_id = r.id
      AND rv.is_visible = TRUE
    ${whereSql}
    GROUP BY f.id, r.id
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM favorites f
    JOIN resorts r ON r.id = f.resort_id
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
    SELECT id, name, is_active
    FROM resorts
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const findFavorite = async (userId, resortId) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      f.id,
      f.user_id,
      f.resort_id,
      r.name AS resort_name,
      r.country,
      r.city,
      r.is_active,
      f.created_by,
      f.updated_by,
      f.created_at,
      f.updated_at
    FROM favorites f
    JOIN resorts r ON r.id = f.resort_id
    WHERE f.user_id = ?
      AND f.resort_id = ?
    LIMIT 1
    `,
    [userId, resortId]
  );

  return rows[0] || null;
};

const findFavoriteById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      f.id,
      f.user_id,
      f.resort_id,
      r.name AS resort_name,
      r.country,
      r.city,
      r.is_active,
      f.created_by,
      f.updated_by,
      f.created_at,
      f.updated_at
    FROM favorites f
    JOIN resorts r ON r.id = f.resort_id
    WHERE f.id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createFavorite = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO favorites
      (user_id, resort_id, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [
      data.user_id,
      data.resort_id,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const deleteFavorite = async (userId, resortId) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM favorites
    WHERE user_id = ?
      AND resort_id = ?
    `,
    [userId, resortId]
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
  listFavoritesByUser,
  findResortById,
  findFavorite,
  findFavoriteById,
  createFavorite,
  deleteFavorite,
  createAuditLog,
};

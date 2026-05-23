const { getMySQLPool } = require("../config/mysql");

const buildSetSql = (data) => {
  const fields = Object.keys(data);
  const setSql = fields.map((field) => `\`${field}\` = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  return {
    setSql,
    values,
  };
};

const mapReview = (row) => {
  if (!row) return null;

  return {
    ...row,
    is_visible: Boolean(row.is_visible),
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

const listReviewsByResort = async (filters) => {
  const pool = getMySQLPool();

  const where = ["rv.resort_id = ?"];
  const params = [filters.resort_id];

  if (!filters.include_hidden) {
    where.push("rv.is_visible = TRUE");
  }

  if (filters.rating) {
    where.push("rv.rating = ?");
    params.push(Number(filters.rating));
  }

  if (filters.q) {
    where.push(
      "(rv.comment LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)"
    );

    const search = `%${filters.q}%`;
    params.push(search, search, search, search);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [rows] = await pool.query(
    `
    SELECT
      rv.id,
      rv.user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email AS user_email,
      rv.resort_id,
      r.name AS resort_name,
      rv.rating,
      rv.comment,
      rv.is_visible,
      rv.created_by,
      rv.updated_by,
      rv.created_at,
      rv.updated_at
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    JOIN resorts r ON r.id = rv.resort_id
    ${whereSql}
    ORDER BY rv.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    JOIN resorts r ON r.id = rv.resort_id
    ${whereSql}
    `,
    params
  );

  return {
    rows: rows.map(mapReview),
    total: countRows[0].total,
  };
};

const getReviewSummaryByResort = async (resortId) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating,
      COUNT(*) AS review_count
    FROM reviews
    WHERE resort_id = ?
      AND is_visible = TRUE
    `,
    [resortId]
  );

  return rows[0] || { average_rating: 0, review_count: 0 };
};

const findReviewById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      rv.id,
      rv.user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email AS user_email,
      rv.resort_id,
      r.name AS resort_name,
      rv.rating,
      rv.comment,
      rv.is_visible,
      rv.created_by,
      rv.updated_by,
      rv.created_at,
      rv.updated_at
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    JOIN resorts r ON r.id = rv.resort_id
    WHERE rv.id = ?
    LIMIT 1
    `,
    [id]
  );

  return mapReview(rows[0]);
};

const createReview = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO reviews
      (
        user_id,
        resort_id,
        rating,
        comment,
        is_visible,
        created_by,
        updated_by
      )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.user_id,
      data.resort_id,
      data.rating,
      data.comment,
      data.is_visible,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const updateReview = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE reviews
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
  findResortById,
  listReviewsByResort,
  getReviewSummaryByResort,
  findReviewById,
  createReview,
  updateReview,
  createAuditLog,
};

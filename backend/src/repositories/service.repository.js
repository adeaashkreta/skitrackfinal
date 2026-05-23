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

// ========================
// Service types
// ========================

const listServiceTypes = async (filters) => {
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
    SELECT
      id,
      name,
      description,
      created_by,
      updated_by,
      created_at,
      updated_at
    FROM service_types
    ${whereSql}
    ORDER BY name ASC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM service_types
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const findServiceTypeById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      created_by,
      updated_by,
      created_at,
      updated_at
    FROM service_types
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createServiceType = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO service_types
      (name, description, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [data.name, data.description, data.created_by, data.updated_by]
  );

  return result.insertId;
};

const updateServiceType = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE service_types
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

const deleteServiceType = async (id) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM service_types
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
};

// ========================
// Resort services
// ========================

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

const buildResortServicesWhere = (filters) => {
  const where = [];
  const params = [];

  if (filters.q) {
    where.push(
      `(rs.name LIKE ? OR rs.description LIKE ? OR st.name LIKE ? OR r.name LIKE ?)`
    );

    const search = `%${filters.q}%`;
    params.push(search, search, search, search);
  }

  if (filters.resort_id) {
    where.push("rs.resort_id = ?");
    params.push(filters.resort_id);
  }

  if (filters.service_type_id) {
    where.push("rs.service_type_id = ?");
    params.push(filters.service_type_id);
  }

  if (filters.is_available !== undefined && filters.is_available !== "") {
    where.push("rs.is_available = ?");
    params.push(
      filters.is_available === true ||
        filters.is_available === "true" ||
        filters.is_available === "1" ||
        filters.is_available === 1
        ? 1
        : 0
    );
  }

  if (filters.min_price) {
    where.push("rs.price >= ?");
    params.push(filters.min_price);
  }

  if (filters.max_price) {
    where.push("rs.price <= ?");
    params.push(filters.max_price);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  return {
    whereSql,
    params,
  };
};

const listResortServices = async (filters) => {
  const pool = getMySQLPool();
  const { whereSql, params } = buildResortServicesWhere(filters);

  const [rows] = await pool.query(
    `
    SELECT
      rs.id,
      rs.resort_id,
      r.name AS resort_name,
      rs.service_type_id,
      st.name AS service_type_name,
      st.description AS service_type_description,
      rs.name,
      rs.description,
      rs.price,
      rs.duration,
      rs.is_available,
      rs.created_by,
      rs.updated_by,
      rs.created_at,
      rs.updated_at
    FROM resort_services rs
    JOIN resorts r ON r.id = rs.resort_id
    JOIN service_types st ON st.id = rs.service_type_id
    ${whereSql}
    ORDER BY r.name ASC, rs.name ASC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM resort_services rs
    JOIN resorts r ON r.id = rs.resort_id
    JOIN service_types st ON st.id = rs.service_type_id
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const findResortServiceById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      rs.id,
      rs.resort_id,
      r.name AS resort_name,
      rs.service_type_id,
      st.name AS service_type_name,
      st.description AS service_type_description,
      rs.name,
      rs.description,
      rs.price,
      rs.duration,
      rs.is_available,
      rs.created_by,
      rs.updated_by,
      rs.created_at,
      rs.updated_at
    FROM resort_services rs
    JOIN resorts r ON r.id = rs.resort_id
    JOIN service_types st ON st.id = rs.service_type_id
    WHERE rs.id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createResortService = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO resort_services
      (
        resort_id,
        service_type_id,
        name,
        description,
        price,
        duration,
        is_available,
        created_by,
        updated_by
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.resort_id,
      data.service_type_id,
      data.name,
      data.description || null,
      data.price,
      data.duration || null,
      data.is_available,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const updateResortService = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE resort_services
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

const deactivateResortService = async (id, userId) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    UPDATE resort_services
    SET is_available = FALSE,
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
    // Audit log nuk duhet me e rrëzu endpoint-in kryesor.
  }
};

module.exports = {
  listServiceTypes,
  findServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  findResortById,
  listResortServices,
  findResortServiceById,
  createResortService,
  updateResortService,
  deactivateResortService,
  createAuditLog,
};

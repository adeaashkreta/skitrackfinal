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

const listFacilities = async (filters) => {
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
    FROM facilities
    ${whereSql}
    ORDER BY name ASC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM facilities
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const findFacilityById = async (id) => {
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
    FROM facilities
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const createFacility = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO facilities
      (name, description, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [
      data.name,
      data.description,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const updateFacility = async (id, data) => {
  const pool = getMySQLPool();
  const { setSql, values } = buildSetSql(data);

  const [result] = await pool.query(
    `
    UPDATE facilities
    SET ${setSql}
    WHERE id = ?
    `,
    [...values, id]
  );

  return result.affectedRows > 0;
};

const deleteFacility = async (id) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM facilities
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
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

const listFacilitiesByResort = async (filters) => {
  const pool = getMySQLPool();

  const where = ["rf.resort_id = ?"];
  const params = [filters.resort_id];

  if (filters.q) {
    where.push("(f.name LIKE ? OR f.description LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [rows] = await pool.query(
    `
    SELECT
      rf.id AS resort_facility_id,
      rf.resort_id,
      r.name AS resort_name,
      rf.facility_id,
      f.name AS facility_name,
      f.description AS facility_description,
      rf.created_by,
      rf.updated_by,
      rf.created_at,
      rf.updated_at
    FROM resort_facilities rf
    JOIN resorts r ON r.id = rf.resort_id
    JOIN facilities f ON f.id = rf.facility_id
    ${whereSql}
    ORDER BY f.name ASC
    LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, filters.offset]
  );

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM resort_facilities rf
    JOIN facilities f ON f.id = rf.facility_id
    ${whereSql}
    `,
    params
  );

  return {
    rows,
    total: countRows[0].total,
  };
};

const attachFacilityToResort = async (data) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    INSERT INTO resort_facilities
      (resort_id, facility_id, created_by, updated_by)
    VALUES (?, ?, ?, ?)
    `,
    [
      data.resort_id,
      data.facility_id,
      data.created_by,
      data.updated_by,
    ]
  );

  return result.insertId;
};

const findResortFacilityById = async (id) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      rf.id,
      rf.resort_id,
      r.name AS resort_name,
      rf.facility_id,
      f.name AS facility_name,
      f.description AS facility_description,
      rf.created_by,
      rf.updated_by,
      rf.created_at,
      rf.updated_at
    FROM resort_facilities rf
    JOIN resorts r ON r.id = rf.resort_id
    JOIN facilities f ON f.id = rf.facility_id
    WHERE rf.id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const findResortFacility = async (resortId, facilityId) => {
  const pool = getMySQLPool();

  const [rows] = await pool.query(
    `
    SELECT
      rf.id,
      rf.resort_id,
      r.name AS resort_name,
      rf.facility_id,
      f.name AS facility_name,
      f.description AS facility_description,
      rf.created_by,
      rf.updated_by,
      rf.created_at,
      rf.updated_at
    FROM resort_facilities rf
    JOIN resorts r ON r.id = rf.resort_id
    JOIN facilities f ON f.id = rf.facility_id
    WHERE rf.resort_id = ?
      AND rf.facility_id = ?
    LIMIT 1
    `,
    [resortId, facilityId]
  );

  return rows[0] || null;
};

const removeFacilityFromResort = async (resortId, facilityId) => {
  const pool = getMySQLPool();

  const [result] = await pool.query(
    `
    DELETE FROM resort_facilities
    WHERE resort_id = ?
      AND facility_id = ?
    `,
    [resortId, facilityId]
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
  listFacilities,
  findFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  findResortById,
  listFacilitiesByResort,
  attachFacilityToResort,
  findResortFacilityById,
  findResortFacility,
  removeFacilityFromResort,
  createAuditLog,
};
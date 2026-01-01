import db from "../../../config/db.js";

const createInternship = async (intern) => {
  const sql = `INSERT INTO internships
    (title, description, company_id, actor_id, actor_role, duration_months, stipend_min, stipend_max, stipend, location, status, created_by, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    intern.title,
    intern.description || null,
    intern.company_id || null,
    intern.actor_id || null,
    intern.actor_role || null,
    intern.duration_months ?? 3,
    intern.stipend_min ?? null,
    intern.stipend_max ?? null,
    intern.stipend || null,
    intern.location || null,
    intern.status || "draft",
    intern.created_by || null,
    intern.published_at || null,
  ];
  const [res] = await db.query(sql, params);
  return res.insertId;
};

const getInternshipById = async (id) => {
  const [rows] = await db.query(
    `SELECT i.*, c.name AS company_name
     FROM internships i
     LEFT JOIN companies c ON i.company_id = c.id
     WHERE i.id = ?`, [id]
  );
  return rows[0];
};

const updateInternship = async (id, data) => {
  const sets = [];
  const params = [];
  for (const [k, v] of Object.entries(data)) {
    sets.push(`${k} = ?`);
    params.push(v);
  }
  if (sets.length === 0) throw new Error("No fields to update");
  params.push(id);
  const sql = `UPDATE internships SET ${sets.join(", ")} WHERE id = ?`;
  const [res] = await db.query(sql, params);
  return res;
};

const listInternships = async (filters = {}) => {
  let baseSql = `
    FROM internships i
    LEFT JOIN companies c ON i.company_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    baseSql += ` AND i.status = ?`;
    params.push(filters.status);
  }

  if (filters.company_id) {
    baseSql += ` AND i.company_id = ?`;
    params.push(filters.company_id);
  }

  if (filters.company_name) {
    baseSql += ` AND c.name LIKE ?`;
    params.push(`%${filters.company_name}%`);
  }

  if(filters.title) {
    baseSql += ` AND i.title LIKE ?`;
    params.push(`%${filters.title}%`);
  }

  if(filters.duration_months) {
    baseSql += ` AND i.duration_months = ?`;
    params.push(filters.duration_months);
  }

  if (filters.search) {
    baseSql += ` AND MATCH(i.title, i.description) AGAINST(? IN NATURAL LANGUAGE MODE)`;
    params.push(filters.search);
  }

  const dataSql = `
    SELECT 
      i.id,
      i.title,
      i.description,
      i.company_id,
      i.stipend_min,
      i.stipend_max,
      i.stipend,
      i.duration_months,
      i.location,
      i.status,
      i.published_at,
      i.created_at,
      c.name AS company_name
    ${baseSql}
    ORDER BY i.published_at DESC, i.created_at DESC
    LIMIT ?, ?
  `;

  const dataParams = [...params, filters.offset ?? 0, filters.limit ?? 10];
  const [rows] = await db.query(dataSql, dataParams);

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total ${baseSql}`,
    params
  );

  const [[{ totalLive }]] = await db.query(
    `SELECT COUNT(*) AS totalLive ${baseSql} AND i.status = 'live'`,
    params
  );

  const [statusRows] = await db.query(`
    SELECT status, COUNT(*) AS count
    FROM internships
    GROUP BY status
  `);

  const byStatus = {};
  statusRows.forEach((r) => (byStatus[r.status] = r.count));

  const [byCompany] = await db.query(`
    SELECT
      c.id AS company_id,
      c.name AS company_name,
      c.verified AS company_status,
      COUNT(i.id) AS total_internships,
      SUM(i.status = 'live') AS live_internships
    FROM internships i
    JOIN companies c ON c.id = i.company_id
    GROUP BY c.id
  `);

  return {
    rows,
    total,
    totalLive,
    byStatus,
    byCompany,
  };
};

const internshipIncrementViews = async (id) => {
  const [res] = await db.query(`UPDATE internships SET views_count = COALESCE(views_count,0) + 1 WHERE id = ?`, [id]);
  return res;
};

export default {
  createInternship,
  getInternshipById,
  updateInternship,
  listInternships,
  internshipIncrementViews,
};

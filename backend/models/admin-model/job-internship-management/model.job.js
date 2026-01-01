const db = require('../../../config/db.js');

const createJob = async (job) => {
  const sql = `
    INSERT INTO jobs (
      title,
      description,
      company_id,
      actor_id,
      actor_role,
      job_type,
      location,
      min_salary,
      max_salary,
      salary_range,
      requirements,
      responsibilities,
      status,
      created_by,
      published_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    job.title,
    job.description || null,
    job.company_id || null,
    job.actor_id,
    job.actor_role,
    job.job_type || "full-time",
    job.location || null,
    job.min_salary ?? null,
    job.max_salary ?? null,
    job.salary_range || null,
    job.requirements ? JSON.stringify(job.requirements) : null,
    job.responsibilities || null,
    job.status || "draft",
    job.created_by,
    job.published_at || null,
  ];

  const [res] = await db.query(sql, params);
  return res.insertId;
};


const getJobById = async (id) => {
  const [rows] = await db.query(
    `SELECT j.*, c.name AS company_name
     FROM jobs j
     LEFT JOIN companies c ON j.company_id = c.id
     WHERE j.id = ?`,
    [id]
  );
  return rows[0];
};

const updateJob = async (id, data) => {
  const sets = [];
  const params = [];
  for (const [k, v] of Object.entries(data)) {
    if (k === "requirements") {
      sets.push(`requirements = ?`);
      params.push(v ? JSON.stringify(v) : null);
    } else {
      sets.push(`${k} = ?`);
      params.push(v);
    }
  }
  if (sets.length === 0) throw new Error("No fields to update");
  params.push(id);
  const sql = `UPDATE jobs SET ${sets.join(", ")} WHERE id = ?`;
  const [res] = await db.query(sql, params);
  return res;
};

const listJobs = async (filters = {}) => {
  let baseSql = `
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    baseSql += ` AND j.status = ?`;
    params.push(filters.status);
  }

  if (filters.company_id) {
    baseSql += ` AND j.company_id = ?`;
    params.push(filters.company_id);
  }

  if (filters.company_name) {
    baseSql += ` AND c.name LIKE ?`;
    params.push(`%${filters.company_name}%`);
  }

  if (filters.job_type) {
    baseSql += ` AND j.job_type = ?`;
    params.push(filters.job_type);
  }

  if(filters.title) {
    baseSql += ` AND j.title LIKE ?`;
    params.push(`%${filters.title}%`);
  }

  if (filters.search) {
    baseSql += ` AND MATCH(j.title, j.description) AGAINST(? IN NATURAL LANGUAGE MODE)`;
    params.push(filters.search);
  }

  const dataSql = `
    SELECT 
      j.id, j.title, j.description, j.company_id, c.name AS company_name, j.job_type, j.location,j.min_salary, j.max_salary,
      j.salary_range, j.requirements, j.responsibilities, j.status, j.published_at, j.status, j.created_at
    ${baseSql}
    ORDER BY j.published_at DESC, j.created_at DESC
    LIMIT ?, ?
  `;

  const dataParams = [...params, filters.offset ?? 0, filters.limit ?? 10];
  const [rows] = await db.query(dataSql, dataParams);

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total ${baseSql}`,
    params
  );

  const [[{ totalLive }]] = await db.query(
    `SELECT COUNT(*) AS totalLive ${baseSql} AND j.status = 'live'`,
    params
  );

  const [statusRows] = await db.query(`
    SELECT status, COUNT(*) AS count
    FROM jobs
    GROUP BY status
  `);

  const byStatus = {};
  statusRows.forEach((r) => (byStatus[r.status] = r.count));

  const [byCompany] = await db.query(`
    SELECT 
      c.id AS company_id,
      c.name AS company_name,
      c.verified AS company_status,
      COUNT(j.id) AS total_jobs,
      SUM(j.status = 'live') AS live_jobs
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
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

const jobIncrementViews = async (id) => {
  const [res] = await db.query(`UPDATE jobs SET views_count = views_count + 1 WHERE id = ?`, [id]);
  return res;
};

module.exports = {
  createJob,
  getJobById,
  updateJob,
  listJobs,
  jobIncrementViews,
};
import db from "../../../config/db.js";

const applyJob = async ({ job_id, candidate_id, resume_url, cover_letter, application_source }) => {
  const sql = `INSERT INTO job_applicants (job_id, candidate_id, resume_url, cover_letter, application_source)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [job_id, candidate_id, resume_url || null, cover_letter || null, application_source || "web"];
  const [res] = await db.query(sql, params);
  return res.insertId;
};

const getApplicantsByJob = async (jobId, filters = {}) => {
  let baseSql = `
    FROM job_applicants ja
    JOIN candidates c ON ja.candidate_id = c.id
    WHERE ja.job_id = ?
  `;

  const params = [jobId];

  if (filters.status) {
    baseSql += ` AND ja.status = ?`;
    params.push(filters.status);
  }

  if (filters.name) {
    baseSql += ` AND c.name LIKE ?`;
    params.push(`%${filters.name}%`);
  }

  if (filters.email) {
    baseSql += ` AND c.email LIKE ?`;
    params.push(`%${filters.email}%`);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total ${baseSql}`,
    params
  );

  const dataSql = `
    SELECT
      ja.*,
      c.name AS candidate_name,
      c.email AS candidate_email
    ${baseSql}
    ORDER BY ja.applied_at DESC
    LIMIT ? OFFSET ?
  `;

  const dataParams = [...params, filters.limit, filters.offset];

  const [rows] = await db.query(dataSql, dataParams);

  return { rows, total };
};


const updateApplicationStatus = async (applicationId, jobId, status, updatedBy = null) => {
  const sql = `
    UPDATE job_applicants
    SET status = ?, status_updated_by = ?, updated_at = NOW()
    WHERE id = ? AND job_id = ?
  `;

  const [res] = await db.query(sql, [status, updatedBy, applicationId, jobId]);

  return res;
};


export default {
  applyJob,
  getApplicantsByJob,
  updateApplicationStatus,
};

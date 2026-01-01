const db = require('../../../config/db.js');

const applyInternship = async ({ internship_id, candidate_id, resume_url, cover_letter, application_source }) => {
  const sql = `INSERT INTO internship_applicants (internship_id, candidate_id, resume_url, cover_letter, application_source)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [internship_id, candidate_id, resume_url || null, cover_letter || null, application_source || "web"];
  const [res] = await db.query(sql, params);
  return res.insertId;
};

const getApplicantsByInternship = async (internshipId, filters = {}) => {
  let baseSql = `
    FROM internship_applicants ia
    JOIN candidates c ON ia.candidate_id = c.id
    WHERE ia.internship_id = ?
  `;

  const params = [internshipId];

  if (filters.status) {
    baseSql += ` AND ia.status = ?`;
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

  // Total count
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total ${baseSql}`,
    params
  );

  const dataSql = `
    SELECT 
      ia.*,
      c.name AS candidate_name,
      c.email AS candidate_email
    ${baseSql}
    ORDER BY ia.applied_at DESC
    LIMIT ? OFFSET ?
  `;

  const dataParams = [...params, filters.limit, filters.offset];

  const [rows] = await db.query(dataSql, dataParams);

  return { rows, total };
};



const updateApplicationStatus = async (applicationId, internshipId, status, updatedBy = null) => {
  const sql = `
    UPDATE internship_applicants
    SET status = ?, status_updated_by = ?, updated_at = NOW()
    WHERE id = ? AND internship_id = ?
  `;
  const [res] = await db.query(sql, [status, updatedBy, applicationId, internshipId]);
  return res;
};

module.exports = {
  applyInternship,
  getApplicantsByInternship,
  updateApplicationStatus,
};

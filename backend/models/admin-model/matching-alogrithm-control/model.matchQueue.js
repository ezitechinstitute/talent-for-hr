const db = require('../../../config/db.js');

const enqueueJob = async (jobId, source = "manual") => {
  const sql = "INSERT INTO match_queue (job_id, trigger_source) VALUES (?, ?)";
  const [result] = await db.query(sql, [jobId, source]);
  return result.insertId;
};

const updateStatus = async (id, status, errorText = null) => {
  const sql = "UPDATE match_queue SET status=?, error_text=? WHERE id=?";
  await db.query(sql, [status, errorText, id]);
};

const matchingListJobs = async () => {
  const [rows] = await db.query(`
    SELECT
      id,
      title,
      description,
      requirements,
      company_id,
      job_type,
      location
    FROM jobs
    WHERE status = 'live'
  `);
  return rows;
};

const matchingListInternships = async () => {
  const [rows] = await db.query(`
    SELECT
      id,
      title,
      description,
      company_id,
      location
    FROM internships
    WHERE status = 'live'
  `);
  return rows;
};






module.exports = { enqueueJob, updateStatus, matchingListJobs, matchingListInternships };

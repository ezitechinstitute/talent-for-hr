const db = require('../../../config/db.js');

// Get all results for an assessment
const getResultsByAssessmentId = async (assessmentId) => {
  try {
    const sql = `
      SELECT cr.*, c.name as candidate_name, c.email as candidate_email, a.title as assessment_title
      FROM candidate_results cr
      JOIN candidates c ON cr.candidate_id = c.id
      JOIN assessments a ON cr.assessment_id = a.id
      WHERE cr.assessment_id = ?
      ORDER BY cr.submitted_at DESC
    `;
    const [rows] = await db.query(sql, [assessmentId]);
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get result by ID
const getResultById = async (id) => {
  try {
    const sql = `
      SELECT cr.*, c.name as candidate_name, c.email as candidate_email, a.title as assessment_title
      FROM candidate_results cr
      JOIN candidates c ON cr.candidate_id = c.id
      JOIN assessments a ON cr.assessment_id = a.id
      WHERE cr.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// Get candidate's result for an assessment
const getCandidateResult = async (candidateId, assessmentId) => {
  try {
    const sql = `SELECT * FROM candidate_results WHERE candidate_id = ? AND assessment_id = ?`;
    const [rows] = await db.query(sql, [candidateId, assessmentId]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// Get all results for a candidate
const getResultsByCandidateId = async (candidateId) => {
  try {
    const sql = `
      SELECT cr.*, a.title as assessment_title, a.type as assessment_type, a.difficulty
      FROM candidate_results cr
      JOIN assessments a ON cr.assessment_id = a.id
      WHERE cr.candidate_id = ?
      ORDER BY cr.submitted_at DESC
    `;
    const [rows] = await db.query(sql, [candidateId]);
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get attempt number for candidate
const getAttemptNumber = async (candidateId, assessmentId) => {
  try {
    const sql = `SELECT MAX(attempt_number) as max_attempt 
                 FROM candidate_results 
                 WHERE candidate_id = ? AND assessment_id = ?`;
    const [rows] = await db.query(sql, [candidateId, assessmentId]);
    return (rows[0]?.max_attempt || 0) + 1;
  } catch (err) {
    throw err;
  }
};

// Create/Initialize candidate result
const createCandidateResult = async (candidateId, assessmentId) => {
  try {
    const attemptNumber = await getAttemptNumber(candidateId, assessmentId);
    const sql = `INSERT INTO candidate_results 
                 (candidate_id, assessment_id, status, started_at, attempt_number) 
                 VALUES (?, ?, 'pending', NOW(), ?)`;
    const [result] = await db.query(sql, [candidateId, assessmentId, attemptNumber]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

// Submit assessment result
const submitResult = async (resultId, score, timeTakenMinutes) => {
  try {
    const sql = `UPDATE candidate_results 
                 SET score=?, status='completed', submitted_at=NOW(), time_taken_minutes=? 
                 WHERE id=?`;
    const [result] = await db.query(sql, [score, timeTakenMinutes || null, resultId]);
    return result;
  } catch (err) {
    throw err;
  }
};

// Check if candidate already completed this assessment
const checkExistingResult = async (candidateId, assessmentId) => {
  try {
    const sql = `SELECT * FROM candidate_results 
                 WHERE candidate_id = ? AND assessment_id = ? AND status = 'completed'
                 ORDER BY attempt_number DESC
                 LIMIT 1`;
    const [rows] = await db.query(sql, [candidateId, assessmentId]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// Get assessment statistics
const getAssessmentStats = async (assessmentId) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_attempts,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_attempts,
        AVG(CASE WHEN status = 'completed' THEN score ELSE NULL END) as average_score,
        MAX(CASE WHEN status = 'completed' THEN score ELSE NULL END) as highest_score,
        MIN(CASE WHEN status = 'completed' THEN score ELSE NULL END) as lowest_score
      FROM candidate_results
      WHERE assessment_id = ?
    `;
    const [rows] = await db.query(sql, [assessmentId]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// Get performance distribution
const getPerformanceDistribution = async (assessmentId) => {
  try {
    const sql = `
      SELECT 
        CASE 
          WHEN score >= 90 THEN '90-100'
          WHEN score >= 80 THEN '80-89'
          WHEN score >= 70 THEN '70-79'
          WHEN score >= 60 THEN '60-69'
          WHEN score >= 50 THEN '50-59'
          ELSE 'Below 50'
        END as score_range,
        COUNT(*) as count
      FROM candidate_results
      WHERE assessment_id = ? AND status = 'completed'
      GROUP BY score_range
      ORDER BY score_range DESC
    `;
    const [rows] = await db.query(sql, [assessmentId]);
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get recent submissions
const getRecentSubmissions = async (limit = 10) => {
  try {
    const sql = `
      SELECT cr.*, c.name as candidate_name, a.title as assessment_title
      FROM candidate_results cr
      JOIN candidates c ON cr.candidate_id = c.id
      JOIN assessments a ON cr.assessment_id = a.id
      WHERE cr.status = 'completed'
      ORDER BY cr.submitted_at DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [limit]);
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getResultsByAssessmentId,
  getResultById,
  getCandidateResult,
  getResultsByCandidateId,
  createCandidateResult,
  submitResult,
  getAssessmentStats,
  getPerformanceDistribution,
  getRecentSubmissions,
  checkExistingResult,
  getAttemptNumber
};


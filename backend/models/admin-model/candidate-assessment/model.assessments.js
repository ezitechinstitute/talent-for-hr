import db from "../../../config/db.js";

// Get all assessments
const getAllAssessments = async () => {
  try {
    const sql = `SELECT * FROM assessments ORDER BY created_at DESC`;
    const [rows] = await db.query(sql);
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get assessment by ID
const getAssessmentById = async (id) => {
  try {
    const sql = `SELECT * FROM assessments WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// Get assessment with questions
const getAssessmentWithQuestions = async (id) => {
  try {
    const assessmentSql = `SELECT * FROM assessments WHERE id = ?`;
    const [assessment] = await db.query(assessmentSql, [id]);
    
    if (assessment.length === 0) {
      return null;
    }

    const questionsSql = `SELECT * FROM assessment_questions WHERE assessment_id = ? ORDER BY question_order ASC, id ASC`;
    const [questions] = await db.query(questionsSql, [id]);
    
    // Parse JSON options if they exist
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null
    }));

    return {
      ...assessment[0],
      questions: parsedQuestions
    };
  } catch (err) {
    throw err;
  }
};

// Create new assessment
const createAssessment = async (title, description, type, difficulty, total_marks, time_limit_minutes, attempt_limit, status, company_id) => {
  try {
    const sql = `INSERT INTO assessments 
                 (title, description, type, difficulty, total_marks, time_limit_minutes, attempt_limit, status, company_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      title, 
      description, 
      type, 
      difficulty, 
      total_marks, 
      time_limit_minutes || null,
      attempt_limit || 1,
      status || 'draft',
      company_id || null
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

// Update assessment
const updateAssessment = async (id, title, description, type, difficulty, total_marks, time_limit_minutes, attempt_limit, status, company_id) => {
  try {
    const sql = `UPDATE assessments 
                 SET title=?, description=?, type=?, difficulty=?, total_marks=?, 
                     time_limit_minutes=?, attempt_limit=?, status=?, company_id=?, updated_at=NOW() 
                 WHERE id=?`;
    const [result] = await db.query(sql, [
      title, 
      description, 
      type, 
      difficulty, 
      total_marks, 
      time_limit_minutes !== undefined ? time_limit_minutes : null,
      attempt_limit !== undefined ? attempt_limit : 1,
      status || 'draft',
      company_id !== undefined ? company_id : null,
      id
    ]);
    return result;
  } catch (err) {
    throw err;
  }
};

// Delete assessment
const deleteAssessment = async (id) => {
  try {
    const sql = `DELETE FROM assessments WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result;
  } catch (err) {
    throw err;
  }
};

// Get assessments by difficulty
const getAssessmentsByDifficulty = async (difficulty) => {
  try {
    const sql = `SELECT * FROM assessments WHERE difficulty = ? ORDER BY created_at DESC`;
    const [rows] = await db.query(sql, [difficulty]);
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get assessments by type
const getAssessmentsByType = async (type) => {
  try {
    const sql = `SELECT * FROM assessments WHERE type = ? ORDER BY created_at DESC`;
    const [rows] = await db.query(sql, [type]);
    return rows;
  } catch (err) {
    throw err;
  }
};

export default {
  getAllAssessments,
  getAssessmentById,
  getAssessmentWithQuestions,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentsByDifficulty,
  getAssessmentsByType
};


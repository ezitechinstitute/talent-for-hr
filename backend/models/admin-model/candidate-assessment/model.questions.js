import db from "../../../config/db.js";

// Get all questions for an assessment
const getQuestionsByAssessmentId = async (assessmentId) => {
  try {
    const sql = `SELECT * FROM assessment_questions 
                 WHERE assessment_id = ? 
                 ORDER BY question_order ASC, id ASC`;
    const [rows] = await db.query(sql, [assessmentId]);
    // Parse JSON options if they exist
    return rows.map(row => ({
      ...row,
      options: row.options ? (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) : null
    }));
  } catch (err) {
    throw err;
  }
};

// Get question by ID
const getQuestionById = async (id) => {
  try {
    const sql = `SELECT * FROM assessment_questions WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    if (!rows[0]) return null;
    // Parse JSON options if they exist
    return {
      ...rows[0],
      options: rows[0].options ? (typeof rows[0].options === 'string' ? JSON.parse(rows[0].options) : rows[0].options) : null
    };
  } catch (err) {
    throw err;
  }
};

// Add question to assessment
const addQuestion = async (assessmentId, question, questionType, options, correctAnswer, marks, questionOrder) => {
  try {
    // If question_order not provided, get max order + 1
    let order = questionOrder;
    if (order === undefined || order === null) {
      const [maxOrder] = await db.query(
        `SELECT MAX(question_order) as max_order FROM assessment_questions WHERE assessment_id = ?`,
        [assessmentId]
      );
      order = (maxOrder[0]?.max_order || 0) + 1;
    }
    
    const sql = `INSERT INTO assessment_questions 
                 (assessment_id, question, question_type, options, correct_answer, marks, question_order) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      assessmentId, 
      question, 
      questionType, 
      options ? JSON.stringify(options) : null, 
      correctAnswer, 
      marks,
      order
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

// Update question
const updateQuestion = async (id, question, questionType, options, correctAnswer, marks, questionOrder) => {
  try {
    const sql = `UPDATE assessment_questions 
                 SET question=?, question_type=?, options=?, correct_answer=?, marks=?, question_order=? 
                 WHERE id=?`;
    const [result] = await db.query(sql, [
      question, 
      questionType, 
      options ? JSON.stringify(options) : null, 
      correctAnswer, 
      marks,
      questionOrder !== undefined ? questionOrder : null,
      id
    ]);
    return result;
  } catch (err) {
    throw err;
  }
};

// Delete question
const deleteQuestion = async (id) => {
  try {
    const sql = `DELETE FROM assessment_questions WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result;
  } catch (err) {
    throw err;
  }
};

// Get total marks for an assessment
const getTotalMarksByAssessmentId = async (assessmentId) => {
  try {
    const sql = `SELECT SUM(marks) as total_marks FROM assessment_questions WHERE assessment_id = ?`;
    const [rows] = await db.query(sql, [assessmentId]);
    return rows[0]?.total_marks || 0;
  } catch (err) {
    throw err;
  }
};

// Get question count for an assessment
const getQuestionCountByAssessmentId = async (assessmentId) => {
  try {
    const sql = `SELECT COUNT(*) as count FROM assessment_questions WHERE assessment_id = ?`;
    const [rows] = await db.query(sql, [assessmentId]);
    return rows[0]?.count || 0;
  } catch (err) {
    throw err;
  }
};

export default {
  getQuestionsByAssessmentId,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getTotalMarksByAssessmentId,
  getQuestionCountByAssessmentId
};


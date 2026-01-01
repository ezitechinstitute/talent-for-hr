import db from "../../../config/db.js";

/**
 * Candidate Assessment Module - Answers Model
 * This model handles storing and retrieving candidate answers for assessments
 */

// Save candidate answers
const saveCandidateAnswers = async (resultId, answers) => {
  try {
    // Delete existing answers for this result if any
    await db.query(`DELETE FROM candidate_answers WHERE result_id = ?`, [resultId]);
    
    // Insert all answers
    if (answers && answers.length > 0) {
      const values = answers.map(answer => [
        resultId,
        answer.questionId,
        answer.answer || null,
        answer.isCorrect || false,
        answer.marksObtained || 0
      ]);
      
      const sql = `INSERT INTO candidate_answers 
                   (result_id, question_id, answer, is_correct, marks_obtained) 
                   VALUES ?`;
      await db.query(sql, [values]);
    }
    
    return true;
  } catch (err) {
    throw err;
  }
};

// Get answers for a result
const getAnswersByResultId = async (resultId) => {
  try {
    const sql = `
      SELECT ca.*, aq.question, aq.question_type, aq.correct_answer, aq.marks
      FROM candidate_answers ca
      JOIN assessment_questions aq ON ca.question_id = aq.id
      WHERE ca.result_id = ?
      ORDER BY aq.question_order, aq.id
    `;
    const [rows] = await db.query(sql, [resultId]);
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get answer for specific question in a result
const getAnswerByQuestionId = async (resultId, questionId) => {
  try {
    const sql = `SELECT * FROM candidate_answers 
                 WHERE result_id = ? AND question_id = ?`;
    const [rows] = await db.query(sql, [resultId, questionId]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

export default {
  saveCandidateAnswers,
  getAnswersByResultId,
  getAnswerByQuestionId
};


const db = require('../../../config/db.js');

// Function to get total number of candidates
const getAllCandidates = async () => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM candidates");
    return rows[0].total;
  } catch (error) {
    throw error;
  }
};

// Function to get number of pending candidates`
const getPendingCandidates = async () => {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM candidates WHERE status = 'pending'`
    );
    return rows[0].total;
  } catch (error) {
    throw error;
  }
};

// Function to get monthly growth of candidates
const getMonthlyGrowth = async () => {
  try {
    const [rows] = await db.query(`
      SELECT MONTH(created_at) AS month, COUNT(*) AS count 
      FROM candidates 
      GROUP BY MONTH(created_at)
    `);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllCandidates, getPendingCandidates, getMonthlyGrowth };

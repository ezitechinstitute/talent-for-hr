const db = require('../../../config/db.js');

// Function to get total number of companies
const getAllCompanies = async () => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM companies");
    return rows[0].total;
  } catch (error) {
    throw error;
  }
};

// Function to get number of pending companies
const getPendingCompanies = async () => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS total FROM companies WHERE verified = 0"
    );
    return rows[0].total;
  } catch (error) {
    throw error;
  }
};

// Function to get monthly growth of companies
const getMonthlyGrowth = async () => {
  try {
    const [rows] = await db.query(
      "SELECT MONTH(created_at) AS month, COUNT(*) AS count FROM companies GROUP BY MONTH(created_at)"
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllCompanies, getPendingCompanies, getMonthlyGrowth };

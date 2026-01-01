const db = require('../../../config/db.js');

// Function to get recent system health alerts
const getSystemHealthAlerts = async () => {
  const [rows] = await db.query(
    "SELECT * FROM system_health ORDER BY created_at DESC LIMIT 5"
  );
  return rows;
};

// Function to insert a new system error
const insertSystemError = async ({ type, message, path, method }) => {
  try {
    await db.query(
      `INSERT INTO system_health (type, message, path, method) VALUES (?, ?, ?, ?)`,
      [type, message, path, method]
    );
  } catch (error) {
    throw error;
  }
};

module.exports = { getSystemHealthAlerts, insertSystemError };

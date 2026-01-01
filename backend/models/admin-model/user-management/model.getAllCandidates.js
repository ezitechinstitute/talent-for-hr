const db = require('../../../config/db.js');

const getAllCandidates = async (search = "") => {
  const sql = `SELECT * FROM candidates WHERE name LIKE ?`;
  const [rows] = await db.query(sql, [`%${search}%`]);
  return rows;
};

module.exports = getAllCandidates;

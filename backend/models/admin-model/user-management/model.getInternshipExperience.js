const db = require('../../../config/db.js');

const getInternshipExperience = async (id) => {
  const [rows] = await db.query(
    "SELECT internship_count, total_experience_months FROM candidates  WHERE id = ?",
    [id]
  );
  return rows[0];
};

module.exports = getInternshipExperience

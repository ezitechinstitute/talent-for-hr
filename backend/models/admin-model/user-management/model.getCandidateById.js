// models/admin-model/user-management/model.getCandidateById.js
import db from '../../../config/db.js';

const getCandidateById = async (id) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM candidates WHERE id = ?', 
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Error fetching candidate: ${error.message}`);
  }
};

export default getCandidateById;
const db = require('../../../config/db.js');

const deactivateCandidate = async (id) => {
  try {
    const [result] = await db.query(
      'UPDATE candidates SET verified = FALSE WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Candidate not found');
    }
    
    return { id, status: 'deactivated' };
  } catch (error) {
    throw new Error(`Error deactivating candidate: ${error.message}`);
  }
};

module.exports = deactivateCandidate;
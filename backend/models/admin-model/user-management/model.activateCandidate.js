import db from '../../../config/db.js';

const activateCandidate = async (id) => {
  try {
    const [result] = await db.query(
      'UPDATE candidates SET verified = TRUE WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Candidate not found');
    }
    
    return { id, status: 'activated' };
  } catch (error) {
    throw new Error(`Error activating candidate: ${error.message}`);
  }
};

export default activateCandidate;
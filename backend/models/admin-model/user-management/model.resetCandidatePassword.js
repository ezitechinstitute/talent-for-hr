const db = require('../../../config/db.js');
const bcrypt = require('bcryptjs');

const resetCandidatePassword = async (id, newPassword) => {
    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await db.query(
        "UPDATE candidates SET password = ? WHERE id = ?", 
        [hashed, id]
    );
    return result;
};

module.exports = resetCandidatePassword;
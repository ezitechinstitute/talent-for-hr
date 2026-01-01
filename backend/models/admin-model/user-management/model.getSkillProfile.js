const db = require('../../../config/db.js');

const getSkillProfile = async (id) => {
    const [rows] = await db.query("SELECT skills FROM candidates WHERE id=?", [id]);
    return rows[0];
};

module.exports = getSkillProfile;
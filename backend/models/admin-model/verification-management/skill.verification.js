const db = require('../../../config/db.js');

const pendingSkill = async () => {
    const sql = `SELECT sv.id, c.name AS candidate_name, 
             sv.skill_name, sv.certification_url, sv.status, sv.admin_remarks
             FROM skill_verifications sv
             JOIN candidates c ON sv.candidate_id = c.id
             WHERE sv.status = 'pending'`;
    const [rows] = await db.query(sql);
    return rows;
};
const viewSkill = async (id) => {
    const sql = `SELECT * FROM skill_verifications WHERE id=?`;
    const [row] = await db.query(sql, [id]);
    return row;
};
const updateStatus = async (id, status, admin_remarks) => {
    const sql = `UPDATE skill_verifications SET status=?, admin_remarks=? WHERE id=?`;
    const [row] = await db.query(sql, [status, admin_remarks, id]);
    return row;
};
const updateAdminRemarks = async (id, admin_remarks) => {
    const sql = `UPDATE skill_verifications SET admin_remarks=? WHERE id=?`;
    const [row] = await db.query(sql, [admin_remarks, id]);
    return row;
};
module.exports = { pendingSkill, viewSkill, updateStatus, updateAdminRemarks };

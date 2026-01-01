const db = require('../../../config/db.js');

//for experience verification management
const getPending = async () => {
  try {
    const sql = `
      SELECT ev.id, c.name AS candidate_name, comp.name AS company_name, 
             ev.position, ev.start_date, ev.end_date, ev.status, ev.admin_remarks
      FROM experience_verifications ev
      JOIN candidates c ON ev.candidate_id = c.id
      JOIN companies comp ON ev.company_id = comp.id
      WHERE ev.status = 'pending'
    `;
    const [rows] = await db.query(sql);
    return rows;
  } catch (err) {
    throw err;
  }
};
//to view document to verify
const viewDocument = async (id) => {
  try {
    const sql = `SELECT document_url FROM experience_verifications WHERE id=?`;
    const [row] = await db.query(sql, [id]);
    return row;
  } catch (err) {
    throw err;
  }
};
//status updation(approve,reject,more info)
const updateVerificationStatus = async (
  id,
  status,
  admin_remarks,
  verified
) => {
    const sql = `UPDATE experience_verifications SET status=? , admin_remarks=?, verified=? WHERE id=?`;
    const [row] = await db.query(sql, [status, admin_remarks, verified, id]);
    return row;
 
};
// update candidate experience after verification
const updateCandidateExperience = async (id, verified_experience) => {
  try {
    const sql = `UPDATE candidates SET verified_experience=? WHERE id=?`;
    const [rows] = await db.query(sql, [verified_experience, id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
//validate experience
const validate = async (companyId) => {
  try {
    const sql = `SELECT *FROM companies WHERE id=?`;
    const [row] = await db.query(sql, [companyId]);
    return row;
  } catch (err) {
    throw err;
  }
};
//getting data by id
const getById = async (id) =>{
  try{
   const sql=`SELECT * FROM experience_verifications WHERE id =?`;
   const [row]=await db.query(sql,[id])
   return row;
  }
  catch(err){
    throw err
  }
}
// adding admin remarks
const addRemarks = async (admin_remarks,id) => {
  try {
    const sql = `UPDATE experience_verifications SET admin_remarks=? WHERE id=?`;
    const [rows] = await db.query(sql, [admin_remarks, id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getPending,
  viewDocument,
  updateCandidateExperience,
  updateVerificationStatus,
  validate,
  addRemarks,
  getById
};

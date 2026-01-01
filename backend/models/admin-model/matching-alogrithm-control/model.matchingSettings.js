import db from "../../../config/db.js";

const getSettings = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM match_settings LIMIT 1");
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const updateSettings = async (payload, adminId) => {
  try {
    const sql = `
    UPDATE match_settings 
    SET skills_weight=?, experience_weight=?, certification_weight=?, 
        assessment_weight=?, internship_priority=?
    WHERE id=1
  `;
    const values = [
      payload.skills_weight,
      payload.experience_weight,
      payload.certification_weight,
      payload.assessment_weight,
      payload.internship_priority,
      payload.auto_matching_enabled,
      adminId,
    ];
    await db.query(sql, values);
    return getSettings();
  } catch (error) {
    throw error;
  }
};

const toggleAutoMatching = async (autoMatchingEnabled, adminId) => {
  try {
    const sql = `UPDATE match_settings 
                 SET auto_matching_enabled=?, updated_by=?, updated_at=CURRENT_TIMESTAMP 
                 WHERE id=1`;
    const values = [autoMatchingEnabled, adminId];
    await db.query(sql, values);

    const [rows] = await db.query("SELECT * FROM match_settings WHERE id=1");
    return rows[0];
  } catch (error) {
    throw error;
  }
};



export default { getSettings, updateSettings, toggleAutoMatching };

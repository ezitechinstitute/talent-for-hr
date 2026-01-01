import db from "../../../config/db.js";

// Save a new activity log
const saveActivityLog = async (log) => {
  const { user_id, user_role, action_type, api_endpoint, module } = log;

  await db.query(
    `INSERT INTO activity_logs (user_id, user_role, action_type, api_endpoint, module)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, user_role, action_type, api_endpoint, module]
  );
};

// Get recent logs
const getRecentActivityLogs = async () => {
  const [rows] = await db.query(
    "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10"
  );
  return rows;
};

export default {
  saveActivityLog,
  getRecentActivityLogs,
};

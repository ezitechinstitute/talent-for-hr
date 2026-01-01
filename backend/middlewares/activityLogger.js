const activityLogsModel = require('../models/admin-model/activity-logs/model.activityLogs.js');

const activityLogger = (req, res, next) => {
  res.on("finish", () => {
    const userId = req.user?.id || 0;
    const userRole = req.user?.role || "guest";

    activityLogsModel
      .saveActivityLog({
        user_id: userId,
        user_role: userRole,
        action_type: req.method,
        api_endpoint: req.originalUrl,
        module: "auto",
      })
      .then(() => {
        console.log("Activity log saved successfully.");
      })
      .catch((err) => {
        console.error("Activity log failed:", err.message, err);
      });
  });

  next();
};

module.exports = activityLogger;

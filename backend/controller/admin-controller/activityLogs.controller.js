import activityLogsModel from "../../models/admin-model/activity-logs/model.activityLogs.js";

// Activity Logs
const logActivity = async (req, res, next) => {
  const { action_type, api_endpoint, module } = req.body;

  await activityLogsModel.saveActivityLog({
    user_id: req.user?.id || null,
    user_role: req.user?.role || null,
    action_type,
    api_endpoint,
    module,
  });

  next();
};

export default logActivity;

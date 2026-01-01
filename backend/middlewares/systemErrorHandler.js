const systemHealthAlertsModel = require('../models/admin-model/admin-dashboard/model.systemHealth.js');

const systemErrorHandler = async (err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Type:", err.name);
  console.error("URL:", req.originalUrl);
  console.error("Method:", req.method);
  console.error("Time:", new Date().toISOString());

  // Save to DB
  try {
    await systemHealthAlertsModel.insertSystemError({
      type: err.name || "SYSTEM_ERROR",
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date(),
    });
  } catch (logErr) {
    console.error("Failed to log system error:", logErr.message);
  }

  // Send response to client
  if (!res.headersSent) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      type: err.name,
    });
  }
};

module.exports = systemErrorHandler;

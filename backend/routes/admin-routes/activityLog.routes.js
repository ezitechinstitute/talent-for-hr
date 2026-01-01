const express = require('express');
const logActivity = require('../../controller/admin-controller/activityLogs.controller.js');
const asyncHandler = require('../../middlewares/asyncHandler.js');
const checkPermission = require('../../middlewares/permission.middleware.js');

const router = express.Router();

// activity logs route
router.post(
  "/log-activity",
  checkPermission("activitylog", "create"),
  asyncHandler(logActivity),
  (req, res) => {
    res.status(200).json({ message: "Activity logged successfully" });
  }
);

module.exports = router;

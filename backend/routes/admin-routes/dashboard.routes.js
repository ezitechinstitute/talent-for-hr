const express = require('express');
const getDashboardStats = require('../../controller/admin-controller/dashboard.controller.js');
const asyncHandler = require('../../middlewares/asyncHandler.js');
const checkPermission = require('../../middlewares/permission.middleware.js');

const router = express.Router();

// dashboard stats
router.get(
  "/dashboard-stats",
  checkPermission("dashboard", "read"),
  asyncHandler(getDashboardStats)
);

module.exports = router;

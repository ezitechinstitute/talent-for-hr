import express from "express";
import getDashboardStats from "../../controller/admin-controller/dashboard.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import checkPermission from "../../middlewares/permission.middleware.js";

const router = express.Router();

// dashboard stats
router.get(
  "/dashboard-stats",
  checkPermission("dashboard", "read"),
  asyncHandler(getDashboardStats)
);

export default router;

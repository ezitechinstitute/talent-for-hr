import express from "express";
import logActivity from "../../controller/admin-controller/activityLogs.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import checkPermission from "../../middlewares/permission.middleware.js";

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

export default router;

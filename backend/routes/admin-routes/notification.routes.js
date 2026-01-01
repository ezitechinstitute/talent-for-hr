import express from "express";
import adminController from "../../controller/admin-controller/admin.contoller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import checkPermission from "../../middlewares/permission.middleware.js";
const { createNotification, markNotificationAsRead, getUnreadNotificationCount } = adminController;

const router = express.Router();

router.post("/notifications/create-notifications",checkPermission("notifications", "create"),asyncHandler(createNotification));
router.patch("/notifications/mark-as-read/:id/read",checkPermission("notifications", "update"),asyncHandler(markNotificationAsRead));
router.get("/notifications/unread-count",checkPermission("notifications", "read"),asyncHandler(getUnreadNotificationCount));

export default router;
const express = require('express');
const adminController = require('../../controller/admin-controller/notification.controller.js');
const asyncHandler = require('../../middlewares/asyncHandler.js');
const checkPermission = require('../../middlewares/permission.middleware.js');
const { createNotification, markNotificationAsRead, getUnreadNotificationCount } = adminController;

const router = express.Router();

router.post("/notifications/create-notifications",checkPermission("notifications", "create"),asyncHandler(createNotification));
router.patch("/notifications/mark-as-read/:id/read",checkPermission("notifications", "update"),asyncHandler(markNotificationAsRead));
router.get("/notifications/unread-count",checkPermission("notifications", "read"),asyncHandler(getUnreadNotificationCount));

module.exports = router;
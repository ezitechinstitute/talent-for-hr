const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler.js');
const checkPermission = require('../../middlewares/permission.middleware.js');
const supportTicketingController = require('../../controller/admin-controller/support-ticketing.controller.js');

const router = express.Router();

const {
  createTicket,
  listTickets,
  getTicketDetail,
  addTicketMessage,
  assignTicketToAdmin,
  updateTicketStatus,
  getTicketHistory,
} = supportTicketingController;

// ==================== Ticket Routes ====================
router.post(
  "/tickets",
  checkPermission("support_ticketing", "create"),
  asyncHandler(createTicket)
);
router.get(
  "/tickets",
  checkPermission("support_ticketing", "read"),
  asyncHandler(listTickets)
);
router.get(
  "/tickets/:id",
  checkPermission("support_ticketing", "read"),
  asyncHandler(getTicketDetail)
);
router.put(
  "/tickets/:id/status",
  checkPermission("support_ticketing", "update"),
  asyncHandler(updateTicketStatus)
);
router.put(
  "/tickets/:id/assign",
  checkPermission("support_ticketing", "update"),
  asyncHandler(assignTicketToAdmin)
);

// ==================== Ticket Message Routes ====================
router.post(
  "/tickets/:ticketId/messages",
  checkPermission("support_ticketing", "create"),
  asyncHandler(addTicketMessage)
);

// ==================== Ticket History Routes ====================
router.get(
  "/tickets/:id/history",
  checkPermission("support_ticketing", "read"),
  asyncHandler(getTicketHistory)
);

module.exports = router;


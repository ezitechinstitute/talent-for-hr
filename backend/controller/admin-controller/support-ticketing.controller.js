// These models are being imported from admin-model/support-ticketing
const ticketModel = require('../../models/admin-model/support-ticketing/model.tickets.js');
const ticketMessagesModel = require('../../models/admin-model/support-ticketing/model.ticketMessages.js');

// ==================== Support / Ticketing Module ====================

// Create ticket (candidate/company)
const createTicket = async (req, res) => {
  try {
    const {
      user_type,
      candidate_id,
      company_id,
      subject,
      description,
      priority,
      attachment_url,
    } = req.body;

    if (!user_type || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "user_type, subject, and description are required",
      });
    }
    if (!["candidate", "company"].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: "user_type must be candidate or company",
      });
    }
    if (priority && !ticketModel.ALLOWED_PRIORITY.includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority value" });
    }

    const ticketId = await ticketModel.createTicket({
      user_type,
      candidate_id,
      company_id,
      subject,
      description,
      priority,
      attachment_url,
    });

    // Add history
    await ticketModel.addHistory(
      ticketId,
      "comment",
      null,
      null,
      null,
      "Ticket created"
    );

    res.status(201).json({
      success: true,
      message: "Ticket created",
      data: { id: ticketId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// List tickets with filters
const listTickets = async (req, res) => {
  try {
    const { status, priority, assigned_admin_id, user_type } = req.query;
    if (status && !ticketModel.ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status filter" });
    }
    if (priority && !ticketModel.ALLOWED_PRIORITY.includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority filter" });
    }

    const tickets = await ticketModel.listTickets({
      status,
      priority,
      assigned_admin_id,
      user_type,
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get ticket detail with messages
const getTicketDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ticketModel.getTicketById(id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    const messages = await ticketMessagesModel.getMessages(id);
    const history = await ticketModel.getHistory(id);

    res
      .status(200)
      .json({ success: true, data: { ticket, messages, history } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add message / respond to ticket
const addTicketMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { sender_type, sender_id, message, attachment_url } = req.body;

    if (!sender_type || !message) {
      return res.status(400).json({
        success: false,
        message: "sender_type and message are required",
      });
    }
    if (!["candidate", "company", "admin"].includes(sender_type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sender_type" });
    }

    const ticket = await ticketModel.getTicketById(ticketId);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    const msgId = await ticketMessagesModel.addMessage(
      ticketId,
      sender_type,
      sender_id,
      message,
      attachment_url
    );
    await ticketModel.addHistory(
      ticketId,
      "comment",
      null,
      null,
      sender_type === "admin" ? sender_id : null,
      "Message added"
    );

    res
      .status(201)
      .json({ success: true, message: "Message added", data: { id: msgId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Assign ticket to support admin
const assignTicketToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;
    const ticket = await ticketModel.getTicketById(id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    await ticketModel.assignTicket(id, admin_id || null);
    await ticketModel.addHistory(
      id,
      "assignment",
      null,
      null,
      admin_id || null,
      "Ticket assigned"
    );

    res
      .status(200)
      .json({ success: true, message: "Ticket assigned successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_id, note } = req.body;

    if (!status || !ticketModel.ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const ticket = await ticketModel.getTicketById(id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    await ticketModel.updateStatus(id, status);
    await ticketModel.addHistory(
      id,
      "status_change",
      ticket.status,
      status,
      admin_id || null,
      note || null
    );

    res.status(200).json({ success: true, message: "Ticket status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get ticket history
const getTicketHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await ticketModel.getHistory(id);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTicket,
  listTickets,
  getTicketDetail,
  addTicketMessage,
  assignTicketToAdmin,
  updateTicketStatus,
  getTicketHistory,
};


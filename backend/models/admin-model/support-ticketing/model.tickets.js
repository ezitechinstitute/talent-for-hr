const db = require('../../../config/db.js');

const ALLOWED_STATUS = ["open", "pending", "resolved", "closed"];
const ALLOWED_PRIORITY = ["low", "medium", "high"];

// Create ticket
const createTicket = async ({
  user_type,
  candidate_id,
  company_id,
  subject,
  description,
  priority,
  attachment_url,
}) => {
  try {
    const sql = `INSERT INTO tickets 
      (user_type, candidate_id, company_id, subject, description, priority, attachment_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      user_type,
      candidate_id || null,
      company_id || null,
      subject,
      description,
      priority || "medium",
      attachment_url || null,
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

// List tickets with filters
const listTickets = async ({ status, priority, assigned_admin_id, user_type }) => {
  try {
    let sql = `SELECT * FROM tickets WHERE 1=1`;
    const params = [];
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND priority = ?`;
      params.push(priority);
    }
    if (assigned_admin_id) {
      sql += ` AND assigned_admin_id = ?`;
      params.push(assigned_admin_id);
    }
    if (user_type) {
      sql += ` AND user_type = ?`;
      params.push(user_type);
    }
    sql += ` ORDER BY updated_at DESC`;
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get ticket by id
const getTicketById = async (id) => {
  try {
    const [rows] = await db.query(`SELECT * FROM tickets WHERE id = ?`, [id]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// Assign ticket to admin
const assignTicket = async (id, admin_id) => {
  try {
    const [result] = await db.query(
      `UPDATE tickets SET assigned_admin_id = ?, updated_at = NOW() WHERE id = ?`,
      [admin_id, id]
    );
    return result;
  } catch (err) {
    throw err;
  }
};

// Update ticket status
const updateStatus = async (id, status) => {
  try {
    const [result] = await db.query(
      `UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );
    return result;
  } catch (err) {
    throw err;
  }
};

// Add history log
const addHistory = async (ticket_id, action, from_status, to_status, changed_by_admin_id, note) => {
  try {
    const sql = `INSERT INTO ticket_history 
      (ticket_id, action, from_status, to_status, changed_by_admin_id, note) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      ticket_id,
      action,
      from_status || null,
      to_status || null,
      changed_by_admin_id || null,
      note || null,
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

// Get ticket history
const getHistory = async (ticket_id) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM ticket_history WHERE ticket_id = ? ORDER BY created_at DESC`,
      [ticket_id]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  ALLOWED_STATUS,
  ALLOWED_PRIORITY,
  createTicket,
  listTickets,
  getTicketById,
  assignTicket,
  updateStatus,
  addHistory,
  getHistory,
};



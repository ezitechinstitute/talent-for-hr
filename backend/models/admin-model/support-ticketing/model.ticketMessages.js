import db from "../../../config/db.js";

// Add message to ticket
const addMessage = async (ticket_id, sender_type, sender_id, message, attachment_url) => {
  try {
    const sql = `INSERT INTO ticket_messages 
      (ticket_id, sender_type, sender_id, message, attachment_url) 
      VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      ticket_id,
      sender_type,
      sender_id || null,
      message,
      attachment_url || null,
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

// Get messages for a ticket
const getMessages = async (ticket_id) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticket_id]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

export default {
  addMessage,
  getMessages,
};



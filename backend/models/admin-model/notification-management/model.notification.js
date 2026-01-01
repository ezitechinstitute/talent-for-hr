import db from "../../../config/db.js";

const createNotification = async ({
  user_id,
  user_type,
  title,
  message,
  reference_module,
  reference_id,
}) => {
  const sql = `
    INSERT INTO notifications
    (user_id, user_type, title, message, reference_module, reference_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await db.query(sql, [
    user_id,
    user_type,
    title,
    message,
    reference_module,
    reference_id,
  ]);
};

const markAsRead = async (notification_id) => {
  const sql = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ?
  `;
  await db.query(sql, [notification_id]);
};

const getUnreadCount = async (user_id, user_type) => {
  const sql = `
    SELECT COUNT(*) AS unread_count
    FROM notifications
    WHERE user_id = ? AND user_type = ? AND is_read = FALSE
  `;
  const [[row]] = await db.query(sql, [user_id, user_type]);
  return row.unread_count;
};

export default { createNotification, markAsRead, getUnreadCount };

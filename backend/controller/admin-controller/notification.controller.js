const notificationService = require('../../models/admin-model/notification-management/model.notification.js');
const emailService = require('../../services/email.service.js');

const createNotification = async (req, res) => {
  const {
    user_id, user_type, title, message, reference_module,
    reference_id, email, email_subject, email_html,
  } = req.body;

  if (!user_id || !user_type || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "Required fields: user_id, user_type, title, message",
    });
  }

  await notificationService.createNotification({
    user_id,
    user_type,
    title,
    message,
    reference_module: reference_module || null,
    reference_id: reference_id || null,
  });

  if (email) {
    if (!email_subject || !email_html) {
      return res.status(400).json({
        success: false,
        message:
          "email_subject and email_html are required when email is provided",
      });
    }

    await emailService.sendEmail({
      to: email,
      subject: email_subject,
      html: email_html,
    });
  }

  return res.status(201).json({
    success: true,
    message: email
      ? "Notification created and email sent successfully"
      : "Notification created successfully",
  });
};

const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Notification ID is required",
    });
  }

  await notificationService.markAsRead(id);

  return res.json({
    success: true,
    message: "Notification marked as read",
  });
};

const getUnreadNotificationCount = async (req, res) => {
  const { user_id, user_type } = req.query;

  if (!user_id || !user_type) {
    return res.status(400).json({
      success: false,
      message: "user_id and user_type are required",
    });
  }

  const unreadCount = await notificationService.getUnreadCount(
    user_id,
    user_type
  );

  return res.json({
    success: true,
    unread_count: unreadCount,
  });
};

module.exports = {
  createNotification,
  markNotificationAsRead,
  getUnreadNotificationCount,
};
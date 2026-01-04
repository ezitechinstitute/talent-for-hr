const notificationService = require('../../models/admin-model/notification-management/model.notification.js');
const emailService = require('../../services/email.service.js');
const db = require('../../config/db.js');

const createNotification = async (req, res) => {
  const {
    user_id,
    user_type,
    title,
    message,
    reference_module,
    reference_id,
    email,
    email_subject,
    email_html,
  } = req.body;

  if (!user_id || !user_type || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "user_id, user_type, title and message are required",
    });
  }

  const [[targetUser]] = await db.query(
    "SELECT id, role FROM users WHERE id = ?",
    [user_id]
  );

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isValidTypeRole =
    (user_type === "admin" && targetUser.role === "admin") ||
    (user_type === "company" && targetUser.role === "hr");

  if (!isValidTypeRole) {
    return res.status(400).json({
      success: false,
      message: `user_type '${user_type}' does not match user role '${targetUser.role}'`,
    });
  }

  if (user_type === "admin") {
    if (reference_module !== "application") {
      return res.status(400).json({
        success: false,
        message: "Admin notifications must use reference_module = application",
      });
    }

    if (reference_id !== null && reference_id !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Admin notifications must not have reference_id",
      });
    }
  }

  if (user_type === "company") {
    const [[company]] = await db.query(
      "SELECT id FROM companies WHERE user_id = ?",
      [targetUser.id]
    );

    if (!company) {
      return res.status(403).json({
        success: false,
        message: "HR user is not linked to any company",
      });
    }

    if (!["jobs", "internships"].includes(reference_module)) {
      return res.status(400).json({
        success: false,
        message: "Company notifications can reference only jobs or internships",
      });
    }

    if (!reference_id) {
      return res.status(400).json({
        success: false,
        message: "reference_id is required for company notifications",
      });
    }

    if (reference_module === "jobs") {
      const [[job]] = await db.query(
        "SELECT id FROM jobs WHERE id = ? AND actor_id = ?",
        [reference_id, targetUser.id]
      );

      if (!job) {
        return res.status(403).json({
          success: false,
          message: "You can reference only jobs created by this HR user",
        });
      }
    }

    if (reference_module === "internships") {
      const [[internship]] = await db.query(
        "SELECT id FROM internships WHERE id = ? AND actor_id = ?",
        [reference_id, targetUser.id]
      );

      if (!internship) {
        return res.status(403).json({
          success: false,
          message: "You can reference only internships created by this HR user",
        });
      }
    }
  }

  await notificationService.createNotification({
    user_id: targetUser.id,
    user_type,
    title,
    message,
    reference_module: reference_module || null,
    reference_id: reference_id || null,
    created_by: req.user.id,
  });

  if (email) {
    if (!email_subject || !email_html) {
      return res.status(400).json({
        success: false,
        message: "email_subject and email_html are required",
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
    message: "Notification created successfully",
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

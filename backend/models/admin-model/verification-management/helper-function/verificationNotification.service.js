const db = require('../../../../config/db.js');
const notificationService = require('../../notification-management/model.notification.js');
const emailService = require('../../../../services/email.service.js');

const handleVerificationStatusNotification = async ({
  verificationId,
  status,
  adminRemarks,
  adminId = null,
}) => {
  try {
    const [[verification]] = await db.query(
      `
      SELECT 
        ev.candidate_id,
        ev.company_id,
        c.email AS candidate_email
      FROM experience_verifications ev
      JOIN candidates c ON c.id = ev.candidate_id
      WHERE ev.id = ?
      `,
      [verificationId]
    );

    if (!verification) {
      console.warn("Verification not found:", verificationId);
      return;
    }

    let company = null;

    if (verification.company_id) {
      const [[companyRow]] = await db.query(
        `
        SELECT id, name, email 
        FROM companies 
        WHERE id = ?
        `,
        [verification.company_id]
      );

      if (companyRow) {
        company = companyRow;
      }
    }

    const statusMessageMap = {
      accepted: "Your experience verification has been accepted.",
      rejected: "Your experience verification has been rejected.",
      more_info_required:
        "More information is required for your experience verification.",
      pending: "Your experience verification is pending review.",
    };

    const candidateMessage =
      statusMessageMap[status] ||
      "Your experience verification status was updated.";

    // Candidate notification
    await notificationService.createNotification({
      user_id: verification.candidate_id,
      user_type: "candidate",
      title: "Experience Verification Update",
      message: candidateMessage,
      reference_module: "verification",
      reference_id: verificationId,
    });

    // Company notification
    if (company?.id) {
      await notificationService.createNotification({
        user_id: company.id,
        user_type: "company",
        title: "Experience Verification Updated",
        message: `Verification status changed to "${status}".`,
        reference_module: "verification",
        reference_id: verificationId,
      });
    }

    // Admin notification
    const [admins] = await db.query(
      "SELECT id FROM users WHERE role IN ('admin','super_admin','verification_admin')"
    );

    for (const admin of admins) {
      await notificationService.createNotification({
        user_id: admin.id,
        user_type: "admin",
        title: "Verification Status Updated",
        message: `Verification ID ${verificationId} updated to "${status}".`,
        reference_module: "verification",
        reference_id: verificationId,
      });
    }

    // Candidate email
    if (verification.candidate_email) {
      await emailService.sendEmail({
        to: verification.candidate_email,
        subject: "Experience Verification Update",
        html: `
          <p>Your experience verification status has been updated.</p>
          <p><b>Status:</b> ${status}</p>
          ${adminRemarks
            ? `<p><b>Admin Remarks:</b> ${adminRemarks}</p>`
            : ""
          }
        `,
      });
    }

    // ✅ Company email 
    if (company?.email) {
      await emailService.sendEmail({
        to: company.email,
        subject: "Experience Verification Status Update",
        html: `
          <p>Hello ${company.name || "Company"},</p>

          <p>
            An experience verification associated with your organization
            has been reviewed by the admin.
          </p>

          <p><b>Status:</b> ${status}</p>

          ${adminRemarks
            ? `<p><b>Admin Remarks:</b> ${adminRemarks}</p>`
            : ""
          }

          <p>
            Please log in to your dashboard for complete details.
          </p>

          <p>
            Regards,<br />
            <strong>Talent Management System</strong>
          </p>
        `,
      });
    }

    // Admin email
    if (process.env.ADMIN_EMAIL) {
      await emailService.sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "Admin Alert: Experience Verification Updated",
        html: `
          <p>Hello Admin,</p>

          <p>
            Experience verification ID <b>${verificationId}</b> has been updated.
          </p>

          <p><b>Status:</b> ${status}</p>

          ${adminRemarks
            ? `<p><b>Admin Remarks:</b> ${adminRemarks}</p>`
            : ""
          }
        `,
      });
    }
  } catch (err) {
    console.error(
      "handleVerificationStatusNotification error:",
      err.message
    );
  }
};

module.exports = { handleVerificationStatusNotification };

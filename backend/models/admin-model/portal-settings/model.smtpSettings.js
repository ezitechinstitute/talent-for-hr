import db from "../../../config/db.js";

/**
 * Portal Settings Module - SMTP Settings Model
 * This model handles email server (SMTP) configuration for sending emails
 */

// Get SMTP settings
const getSMTPSettings = async () => {
  try {
    const sql = `SELECT * FROM smtp_settings WHERE id = 1`;
    const [rows] = await db.query(sql);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Update SMTP settings
 * @param {Object} smtpData - SMTP configuration data
 * @param {string} smtpData.smtp_host - SMTP server host (e.g., smtp.gmail.com)
 * @param {number} smtpData.smtp_port - SMTP port (587 for TLS, 465 for SSL)
 * @param {boolean} smtpData.smtp_secure - Use secure connection (TLS/SSL)
 * @param {string} smtpData.smtp_user - SMTP username/email
 * @param {string} smtpData.smtp_password - SMTP password
 * @param {string} smtpData.from_email - Default sender email
 * @param {string} smtpData.from_name - Default sender name
 * @param {boolean} smtpData.is_active - Enable/disable SMTP
 * @returns {Promise} Database result
 */
const updateSMTPSettings = async (smtpData) => {
  try {
    const {
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_password,
      from_email,
      from_name,
      is_active
    } = smtpData;

    // Check if SMTP settings already exist
    const existing = await getSMTPSettings();
    
    if (existing) {
      // Update existing SMTP settings
      const sql = `UPDATE smtp_settings SET 
        smtp_host = ?,
        smtp_port = ?,
        smtp_secure = ?,
        smtp_user = ?,
        smtp_password = ?,
        from_email = ?,
        from_name = ?,
        is_active = ?,
        updated_at = NOW()
        WHERE id = 1`;
      
      const [result] = await db.query(sql, [
        smtp_host,
        smtp_port,
        smtp_secure,
        smtp_user,
        smtp_password,
        from_email,
        from_name,
        is_active !== undefined ? is_active : true
      ]);
      return result;
    } else {
      // Insert new settings
      const sql = `INSERT INTO smtp_settings 
        (smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, from_name, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const [result] = await db.query(sql, [
        smtp_host,
        smtp_port,
        smtp_secure,
        smtp_user,
        smtp_password,
        from_email,
        from_name,
        is_active !== undefined ? is_active : true
      ]);
      return result;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Test SMTP connection
 * Note: This retrieves settings for testing. Actual connection test would require nodemailer library
 * @returns {Promise<Object>} Settings object for testing
 */
const testSMTPConnection = async () => {
  try {
    const settings = await getSMTPSettings();
    if (!settings) {
      throw new Error("SMTP settings not configured");
    }
    // Return settings for testing (actual test would require nodemailer library)
    return { success: true, message: "SMTP settings retrieved", settings };
  } catch (err) {
    throw err;
  }
};

export default {
  getSMTPSettings,
  updateSMTPSettings,
  testSMTPConnection
};


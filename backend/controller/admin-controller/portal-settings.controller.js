// These models are being imported from admin-model/portal-settings
const platformConfigModel = require('../../models/admin-model/portal-settings/model.platformConfig.js');
const smtpSettingsModel = require('../../models/admin-model/portal-settings/model.smtpSettings.js');
const smsSettingsModel = require('../../models/admin-model/portal-settings/model.smsSettings.js');
const paymentGatewayModel = require('../../models/admin-model/portal-settings/model.paymentGateway.js');
const databaseBackupModel = require('../../models/admin-model/portal-settings/model.databaseBackup.js');

// Utilities
const { encrypt, maskSensitiveData } = require('../../utils/encryption.js');
const {
  isValidEmail,
  isValidPort,
  isValidURL,
} = require("../../utils/validations.js");

// ==================== Portal Settings Module ====================
/**
 * Portal Settings Module Controllers
 * This module handles all portal-level settings including:
 * - Platform configuration (logo, colors, name)
 * - SMTP email settings
 * - SMS API settings
 * - Payment gateway configuration
 * - Database backup controls
 */

// Platform Configuration Controllers
/**
 * Get platform configuration
 * Returns platform-level settings like logo, colors, contact info
 */
const getPlatformConfig = async (req, res) => {
  try {
    const config = await platformConfigModel.getPlatformConfig();
    res.status(200).json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update platform configuration
 * Updates platform name, logo, colors, contact information
 */
const updatePlatformConfig = async (req, res) => {
  try {
    await platformConfigModel.updatePlatformConfig(req.body);
    res.status(200).json({
      success: true,
      message: "Platform configuration updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SMTP Settings Controllers
/**
 * Get SMTP email server settings
 * Returns current SMTP configuration for sending emails
 * Passwords are masked for security
 */
const getSMTPSettings = async (req, res) => {
  try {
    const settings = await smtpSettingsModel.getSMTPSettings();

    // Mask sensitive data
    if (settings) {
      settings.smtp_password = maskSensitiveData(settings.smtp_password);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update SMTP email server settings
 * Updates SMTP host, port, credentials, and activation status
 * Passwords are encrypted before storage
 */
const updateSMTPSettings = async (req, res) => {
  try {
    const { smtp_user, smtp_password, from_email, smtp_port } = req.body;

    // Validate email formats
    if (smtp_user && !isValidEmail(smtp_user)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SMTP user email format",
      });
    }

    if (from_email && !isValidEmail(from_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid from email format",
      });
    }

    // Validate port range
    if (smtp_port && !isValidPort(smtp_port)) {
      return res.status(400).json({
        success: false,
        message: "Invalid port number. Must be between 1 and 65535",
      });
    }

    // Encrypt password if provided
    const settingsData = { ...req.body };
    if (smtp_password) {
      settingsData.smtp_password = encrypt(smtp_password);
    }

    await smtpSettingsModel.updateSMTPSettings(settingsData);
    res
      .status(200)
      .json({ success: true, message: "SMTP settings updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Test SMTP connection
 * Tests the SMTP settings to verify email server connectivity
 */
const testSMTPConnection = async (req, res) => {
  try {
    const result = await smtpSettingsModel.testSMTPConnection();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SMS Settings Controllers
/**
 * Get SMS API settings
 * Returns current SMS provider configuration
 * API secrets are masked for security
 */
const getSMSSettings = async (req, res) => {
  try {
    const settings = await smsSettingsModel.getSMSSettings();

    // Mask sensitive data
    if (settings) {
      settings.api_secret = maskSensitiveData(settings.api_secret);
      settings.api_key = maskSensitiveData(settings.api_key);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update SMS API settings
 * Updates SMS provider, API keys, sender ID, and activation status
 * API secrets are encrypted before storage
 */
const updateSMSSettings = async (req, res) => {
  try {
    const { endpoint_url, api_secret } = req.body;

    // Validate URL if provided
    if (endpoint_url && !isValidURL(endpoint_url)) {
      return res.status(400).json({
        success: false,
        message: "Invalid endpoint URL format",
      });
    }

    // Encrypt API secret if provided
    const settingsData = { ...req.body };
    if (api_secret) {
      settingsData.api_secret = encrypt(api_secret);
    }

    await smsSettingsModel.updateSMSSettings(settingsData);
    res
      .status(200)
      .json({ success: true, message: "SMS settings updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Test SMS API connection
 * Tests the SMS settings to verify API connectivity
 */
const testSMSConnection = async (req, res) => {
  try {
    const result = await smsSettingsModel.testSMSConnection();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Payment Gateway Settings Controllers
/**
 * Get payment gateway settings
 * Returns current payment gateway configuration (Stripe, PayPal, etc.)
 * API secrets are masked for security
 */
const getPaymentGatewaySettings = async (req, res) => {
  try {
    const settings = await paymentGatewayModel.getPaymentGatewaySettings();

    // Mask sensitive data
    if (settings) {
      settings.api_secret = maskSensitiveData(settings.api_secret);
      settings.webhook_secret = maskSensitiveData(settings.webhook_secret);
      settings.api_key = maskSensitiveData(settings.api_key);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update payment gateway settings
 * Updates payment provider, merchant ID, API keys, and test/live mode
 * API secrets are encrypted before storage
 */
const updatePaymentGatewaySettings = async (req, res) => {
  try {
    const { api_secret, webhook_secret } = req.body;

    // Encrypt secrets if provided
    const settingsData = { ...req.body };
    if (api_secret) {
      settingsData.api_secret = encrypt(api_secret);
    }
    if (webhook_secret) {
      settingsData.webhook_secret = encrypt(webhook_secret);
    }

    await paymentGatewayModel.updatePaymentGatewaySettings(settingsData);
    res.status(200).json({
      success: true,
      message: "Payment gateway settings updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Database Backup Controllers
/**
 * Get database backup settings
 * Returns backup frequency, retention, and notification settings
 */
const getBackupSettings = async (req, res) => {
  try {
    const settings = await databaseBackupModel.getBackupSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update database backup settings
 * Updates backup frequency, retention days, auto-backup, and notification settings
 */
const updateBackupSettings = async (req, res) => {
  try {
    await databaseBackupModel.updateBackupSettings(req.body);
    res
      .status(200)
      .json({ success: true, message: "Backup settings updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get backup history
 * Returns list of recent database backups with status and details
 * Query param: limit (default: 10) - Number of records to return
 */
const getBackupHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await databaseBackupModel.getBackupHistory(limit);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Create backup record
 * Creates a new entry in backup history when a backup is performed
 */
const createBackupRecord = async (req, res) => {
  try {
    const backupId = await databaseBackupModel.createBackupRecord(req.body);
    res.status(201).json({
      success: true,
      message: "Backup record created",
      data: { id: backupId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  // Platform Configuration
  getPlatformConfig,
  updatePlatformConfig,
  // SMTP Settings
  getSMTPSettings,
  updateSMTPSettings,
  testSMTPConnection,
  // SMS Settings
  getSMSSettings,
  updateSMSSettings,
  testSMSConnection,
  // Payment Gateway Settings
  getPaymentGatewaySettings,
  updatePaymentGatewaySettings,
  // Database Backup Settings
  getBackupSettings,
  updateBackupSettings,
  getBackupHistory,
  createBackupRecord,
};


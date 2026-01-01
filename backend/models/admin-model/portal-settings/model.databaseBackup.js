const db = require('../../../config/db.js');

/**
 * Portal Settings Module - Database Backup Model
 * This model handles database backup configuration and history tracking
 */

// Get database backup settings
const getBackupSettings = async () => {
  try {
    const sql = `SELECT * FROM database_backup_settings WHERE id = 1`;
    const [rows] = await db.query(sql);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Update database backup settings
 * @param {Object} backupData - Backup configuration data
 * @param {string} backupData.backup_frequency - How often to backup (daily, weekly, monthly)
 * @param {number} backupData.backup_retention_days - How many days to keep backups
 * @param {boolean} backupData.auto_backup_enabled - Enable automatic backups
 * @param {string} backupData.backup_location - Path where backups are stored
 * @param {boolean} backupData.email_notifications - Send email on backup completion
 * @param {string} backupData.notification_email - Email to send notifications to
 * @returns {Promise} Database result
 */
const updateBackupSettings = async (backupData) => {
  try {
    const {
      backup_frequency,
      backup_retention_days,
      auto_backup_enabled,
      backup_location,
      email_notifications,
      notification_email
    } = backupData;

    // Check if backup settings already exist
    const existing = await getBackupSettings();
    
    if (existing) {
      // Update existing backup settings
      const sql = `UPDATE database_backup_settings SET 
        backup_frequency = ?,
        backup_retention_days = ?,
        auto_backup_enabled = ?,
        backup_location = ?,
        email_notifications = ?,
        notification_email = ?,
        updated_at = NOW()
        WHERE id = 1`;
      
      const [result] = await db.query(sql, [
        backup_frequency,
        backup_retention_days,
        auto_backup_enabled !== undefined ? auto_backup_enabled : false,
        backup_location,
        email_notifications !== undefined ? email_notifications : false,
        notification_email
      ]);
      return result;
    } else {
      // Insert new settings
      const sql = `INSERT INTO database_backup_settings 
        (backup_frequency, backup_retention_days, auto_backup_enabled, backup_location, email_notifications, notification_email) 
        VALUES (?, ?, ?, ?, ?, ?)`;
      
      const [result] = await db.query(sql, [
        backup_frequency,
        backup_retention_days,
        auto_backup_enabled !== undefined ? auto_backup_enabled : false,
        backup_location,
        email_notifications !== undefined ? email_notifications : false,
        notification_email
      ]);
      return result;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Get backup history records
 * @param {number} limit - Maximum number of records to return (default: 10)
 * @returns {Promise<Array>} Array of backup history records
 */
const getBackupHistory = async (limit = 10) => {
  try {
    const sql = `SELECT * FROM database_backup_history 
                 ORDER BY created_at DESC 
                 LIMIT ?`;
    const [rows] = await db.query(sql, [limit]);
    return rows;
  } catch (err) {
    throw err;
  }
};

/**
 * Create a new backup record in history
 * @param {Object} backupData - Backup record data
 * @param {string} backupData.backup_file_path - Path to the backup file
 * @param {number} backupData.backup_size - Size of backup file in bytes
 * @param {string} backupData.backup_status - Status (completed, failed, in_progress)
 * @param {string} backupData.backup_type - Type of backup (manual, automatic)
 * @returns {Promise<number>} ID of the created backup record
 */
const createBackupRecord = async (backupData) => {
  try {
    const {
      backup_file_path,
      backup_size,
      backup_status,
      backup_type
    } = backupData;

    const sql = `INSERT INTO database_backup_history 
      (backup_file_path, backup_size, backup_status, backup_type) 
      VALUES (?, ?, ?, ?)`;
    
    const [result] = await db.query(sql, [
      backup_file_path,
      backup_size,
      backup_status || 'completed',
      backup_type || 'manual'
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getBackupSettings,
  updateBackupSettings,
  getBackupHistory,
  createBackupRecord
};


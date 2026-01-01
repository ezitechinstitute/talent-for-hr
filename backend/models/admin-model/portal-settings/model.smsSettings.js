const db = require('../../../config/db.js');

/**
 * Portal Settings Module - SMS Settings Model
 * This model handles SMS API configuration for sending SMS notifications
 */

// Get SMS API settings
const getSMSSettings = async () => {
  try {
    const sql = `SELECT * FROM sms_settings WHERE id = 1`;
    const [rows] = await db.query(sql);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Update SMS API settings
 * @param {Object} smsData - SMS API configuration data
 * @param {string} smsData.provider - SMS provider name (e.g., Twilio, AWS SNS)
 * @param {string} smsData.api_key - API key from SMS provider
 * @param {string} smsData.api_secret - API secret from SMS provider
 * @param {string} smsData.sender_id - Sender ID or phone number
 * @param {string} smsData.endpoint_url - API endpoint URL
 * @param {boolean} smsData.is_active - Enable/disable SMS service
 * @returns {Promise} Database result
 */
const updateSMSSettings = async (smsData) => {
  try {
    const {
      provider,
      api_key,
      api_secret,
      sender_id,
      endpoint_url,
      is_active
    } = smsData;

    // Check if SMS settings already exist
    const existing = await getSMSSettings();
    
    if (existing) {
      // Update existing SMS settings
      const sql = `UPDATE sms_settings SET 
        provider = ?,
        api_key = ?,
        api_secret = ?,
        sender_id = ?,
        endpoint_url = ?,
        is_active = ?,
        updated_at = NOW()
        WHERE id = 1`;
      
      const [result] = await db.query(sql, [
        provider,
        api_key,
        api_secret,
        sender_id,
        endpoint_url,
        is_active !== undefined ? is_active : false
      ]);
      return result;
    } else {
      // Insert new settings
      const sql = `INSERT INTO sms_settings 
        (provider, api_key, api_secret, sender_id, endpoint_url, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)`;
      
      const [result] = await db.query(sql, [
        provider,
        api_key,
        api_secret,
        sender_id,
        endpoint_url,
        is_active !== undefined ? is_active : false
      ]);
      return result;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Test SMS API connection
 * Note: This retrieves settings for testing. Actual test would require SMS API library
 * @returns {Promise<Object>} Settings object for testing
 */
const testSMSConnection = async () => {
  try {
    const settings = await getSMSSettings();
    if (!settings) {
      throw new Error("SMS settings not configured");
    }
    // Return settings for testing (actual test would require SMS API library call)
    return { success: true, message: "SMS settings retrieved", settings };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getSMSSettings,
  updateSMSSettings,
  testSMSConnection
};


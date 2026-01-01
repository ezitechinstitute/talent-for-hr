const db = require('../../../config/db.js');

/**
 * Portal Settings Module - Payment Gateway Settings Model
 * This model handles payment gateway configuration (Stripe, PayPal, etc.)
 */

// Get payment gateway settings
const getPaymentGatewaySettings = async () => {
  try {
    const sql = `SELECT * FROM payment_gateway_settings WHERE id = 1`;
    const [rows] = await db.query(sql);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Update payment gateway settings
 * @param {Object} paymentData - Payment gateway configuration data
 * @param {string} paymentData.gateway_provider - Payment provider name (e.g., Stripe, PayPal)
 * @param {string} paymentData.merchant_id - Merchant ID from payment gateway
 * @param {string} paymentData.api_key - API key from payment gateway
 * @param {string} paymentData.api_secret - API secret from payment gateway
 * @param {string} paymentData.webhook_secret - Webhook secret for verifying webhooks
 * @param {string} paymentData.webhook_secret - Webhook secret for validating incoming requests
 * @param {boolean} paymentData.is_test_mode - Use test/sandbox mode
 * @param {boolean} paymentData.is_active - Enable/disable payment gateway
 * @returns {Promise} Database result
 */
const updatePaymentGatewaySettings = async (paymentData) => {
  try {
    const {
      gateway_provider,
      merchant_id,
      api_key,
      api_secret,
      webhook_secret,
      is_test_mode,
      is_active
    } = paymentData;

    // Check if payment gateway settings already exist
    const existing = await getPaymentGatewaySettings();
    
    if (existing) {
      // Update existing payment gateway settings
      const sql = `UPDATE payment_gateway_settings SET 
        gateway_provider = ?,
        merchant_id = ?,
        api_key = ?,
        api_secret = ?,
        webhook_secret = ?,
        is_test_mode = ?,
        is_active = ?,
        updated_at = NOW()
        WHERE id = 1`;
      
      const [result] = await db.query(sql, [
        gateway_provider,
        merchant_id,
        api_key,
        api_secret,
        webhook_secret,
        is_test_mode !== undefined ? is_test_mode : true,
        is_active !== undefined ? is_active : false
      ]);
      return result;
    } else {
      // Insert new settings
      const sql = `INSERT INTO payment_gateway_settings 
        (gateway_provider, merchant_id, api_key, api_secret, webhook_secret, is_test_mode, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      const [result] = await db.query(sql, [
        gateway_provider,
        merchant_id,
        api_key,
        api_secret,
        webhook_secret,
        is_test_mode !== undefined ? is_test_mode : true,
        is_active !== undefined ? is_active : false
      ]);
      return result;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getPaymentGatewaySettings,
  updatePaymentGatewaySettings
};


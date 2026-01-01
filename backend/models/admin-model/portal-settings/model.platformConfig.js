const db = require('../../../config/db.js');

/**
 
 * This model handles platform-level settings like logo, colors, name, contact info
 */
// Get platform configuration
const getPlatformConfig = async () => {
  try {
    const sql = `SELECT * FROM platform_config WHERE id = 1`;
    const [rows] = await db.query(sql);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Update platform configuration
 * @param {Object} configData - Configuration data object
 * @param {string} configData.platform_name - Name of the platform
 * @param {string} configData.platform_logo - URL/path to platform logo
 * @param {string} configData.primary_color - Primary color hex code
 * @param {string} configData.secondary_color - Secondary color hex code
 * @param {string} configData.accent_color - Accent color hex code
 * @param {string} configData.footer_text - Footer text content
 * @param {string} configData.contact_email - Contact email address
 * @param {string} configData.contact_phone - Contact phone number
 * @param {string} configData.address - Physical address
 * @returns {Promise} Database result
 */
const updatePlatformConfig = async (configData) => {
  try {
    const {
      platform_name,
      platform_logo,
      primary_color,
      secondary_color,
      accent_color,
      footer_text,
      contact_email,
      contact_phone,
      address
    } = configData;

    // Check if config already exists in database
    const existing = await getPlatformConfig();
    
    if (existing) {
      // Update existing configuration record
      const sql = `UPDATE platform_config SET 
        platform_name = ?,
        platform_logo = ?,
        primary_color = ?,
        secondary_color = ?,
        accent_color = ?,
        footer_text = ?,
        contact_email = ?,
        contact_phone = ?,
        address = ?,
        updated_at = NOW()
        WHERE id = 1`;
      
      const [result] = await db.query(sql, [
        platform_name,
        platform_logo,
        primary_color,
        secondary_color,
        accent_color,
        footer_text,
        contact_email,
        contact_phone,
        address
      ]);
      return result;
    } else {
      // Insert new configuration if it doesn't exist (first time setup)
      const sql = `INSERT INTO platform_config 
        (platform_name, platform_logo, primary_color, secondary_color, accent_color, footer_text, contact_email, contact_phone, address) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const [result] = await db.query(sql, [
        platform_name,
        platform_logo,
        primary_color,
        secondary_color,
        accent_color,
        footer_text,
        contact_email,
        contact_phone,
        address
      ]);
      return result;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getPlatformConfig,
  updatePlatformConfig
};


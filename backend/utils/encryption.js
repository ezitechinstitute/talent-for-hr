const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive data (passwords, API secrets)
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text
 */
const encrypt = (text) => {
  if (!text) return null;

  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Encryption error:', err);
    return text; // Return original if encryption fails
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return encryptedText; // Return original if decryption fails
  }
};

/**
 * Mask sensitive data for display (shows only first 4 and last 4 characters)
 * @param {string} text - Text to mask
 * @returns {string} Masked text
 */
const maskSensitiveData = (text) => {
  if (!text || text.length <= 8) return '****';
  return text.slice(0, 4) + '****' + text.slice(-4);
};

module.exports = { encrypt, decrypt, maskSensitiveData };


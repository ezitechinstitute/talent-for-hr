/**
 * Validation utilities for portal settings and assessments
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate hex color code
 * @param {string} color - Color hex code to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHexColor = (color) => {
  if (!color) return false;
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

/**
 * Validate port number (1-65535)
 * @param {number} port - Port number to validate
 * @returns {boolean} True if valid port
 */
export const isValidPort = (port) => {
  if (!port) return false;
  const portNum = parseInt(port);
  return portNum >= 1 && portNum <= 65535;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate assessment status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid status
 */
export const isValidAssessmentStatus = (status) => {
  return ['draft', 'published', 'closed'].includes(status);
};

/**
 * Validate question type
 * @param {string} type - Question type to validate
 * @returns {boolean} True if valid type
 */
export const isValidQuestionType = (type) => {
  return ['MCQ', 'coding', 'scenario'].includes(type);
};


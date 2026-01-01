/**
 * Validation utilities for portal settings and assessments
 */
const isValidEmail = (email) => {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(String(email).toLowerCase());
};

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
const isValidHexColor = (color) => {
  const re = /^#([0-9A-F]{3}){1,2}$/i;
  return re.test(String(color));
};
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
const isValidPort = (port) => {
  const num = Number(port);
  return Number.isInteger(num) && num > 0 && num < 65536;
};
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
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};
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
const isValidAssessmentStatus = (status) => {
  const allowed = ["draft", "published", "archived"];
  return allowed.includes(status);
};
export const isValidAssessmentStatus = (status) => {
  return ['draft', 'published', 'closed'].includes(status);
};

/**
 * Validate question type
 * @param {string} type - Question type to validate
 * @returns {boolean} True if valid type
 */
const isValidQuestionType = (type) => {
  const allowed = ["multiple-choice", "true-false", "short-answer"];
  return allowed.includes(type);
};
module.exports = {
  isValidEmail,
  isValidHexColor,
  isValidPort,
  isValidURL,
  isValidAssessmentStatus,
  isValidQuestionType,
};
export const isValidQuestionType = (type) => {
  return ['MCQ', 'coding', 'scenario'].includes(type);
};


const db = require('../../config/db.js');

const checkExistingUser = async (email) => {
  const [existing] = await db.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  return existing;
};

const signup = async (name, email, hashedPassword, role) => {
  const sql = `INSERT INTO users(
    name,
    email,
    password,
    role
  ) VALUES (?, ?, ?, ?)
`;
  const [row] = await db.query(sql, [name, email, hashedPassword, role]);
  return row;
};

const code = async (email, code, expiry) => {
  // for verification of email
  const sql = `INSERT INTO tokens(
      email,
      verificationCode,
      verificationCodeExpiry
  )VALUES (?,?,?)`;
  const [row] = await db.query(sql, [email, code, expiry]);
  return row;
};

const verifyEmail = async (token, code) => {
  const sql = `SELECT * FROM tokens WHERE token = ? AND verificationCode = ?`;
  const [row] = await db.query(sql, [token, code]);
  return row[0];
};

const clearRefreshToken = async (refreshToken) => {
  //after logging out clearing tokens 
  const sql = `UPDATE tokens SET refreshToken = NULL WHERE refreshToken = ?`;
  const [rows] = await db.query(sql, [refreshToken]);
  return rows;
};

const getUserByEmail = async (email) => {
  const sql = `SELECT * FROM users WHERE email=?`;
  const [row] = await db.query(sql, [email]);
  return row[0];
};

const updatePassword = async (hashedPassword, email) => {
  //updating password in users table
  const updatePasswordSql = `UPDATE users SET password=? WHERE email=?`;
  // clearing up token that was required for password reset and after it not needed
  const clearTokenSql = `
    UPDATE tokens 
    SET resetToken=NULL, resetTokenExpiry=NULL 
    WHERE email=?
  `;

  const [passwordResult] = await db.query(updatePasswordSql, [
    hashedPassword,
    email,
  ]);

  const [tokenResult] = await db.query(clearTokenSql, [email]);

  return {
    passwordUpdated: passwordResult,
    tokenCleared: tokenResult,
  };
};

module.exports = {
  checkExistingUser,
  signup,
  code,
  verifyEmail,
  clearRefreshToken,
  getUserByEmail,
  updatePassword,
};

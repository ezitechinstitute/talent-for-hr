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
  return row;
};

const getAdminByEmail = async (email) => {
  const sql = `SELECT * FROM admin_users WHERE email=?`;
  const [row] = await db.query(sql, [email]);
  return row;
};


module.exports = {
  checkExistingUser,
  signup,
  code,
  verifyEmail,
  clearRefreshToken,
  getUserByEmail,
  getAdminByEmail
};

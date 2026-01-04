const db = require("../../config/db.js");
const { Resend } = require("resend");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const utilsToken = require("../../utils/generateToken.js");
dotenv.config();

const authModel = require("../../models/auth/auth.model.js");
const { generateAuthToken, generateRefreshToken } = utilsToken;

//for email verification
const resend = new Resend(process.env.RESEND_API_KEY);

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check existing user
  const [existing] = await authModel.checkExistingUser(email);
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  //hashed password
  const genSalt = 10;
  const hashedPassword = await bcrypt.hash(password, genSalt);

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry: 2 minutes
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  //data insertion in table
  const result = await authModel.signup(name, email, hashedPassword, role);
  //code insertion for later checking
  const resultCode = await authModel.code(email, code, expiry);

  //check email pattern of hr
  const [allowed] = await db.query(
    `SELECT ? LIKE '%@company.com' AS isCompany,? LIKE '%@gmail.com' AS isGmail `,
    [email, email]
  );
  if (!allowed[0].isCompany && !allowed[0].isGmail && role == "hr") {
    res
      .status(404)
      .json({ message: "HR need to signup with company mail or gmail" });
  }
  // for email verification
  const token = crypto.randomBytes(32).toString("hex");
  
  const expiryVerify = new Date(Date.now() + 15 * 60 * 1000);
  //setting up token and its expiry in tokens table for verification of email
  await db.query(`UPDATE tokens SET token=?,expiryVerify=? WHERE email=?`, [
    token,
    expiryVerify,
    email,
  ]);

  // Send verification email
  const mail = await resend.emails.send({
    // add website domain here and verify in it in resend website
    from: `YourApp ${process.env.DOMAIN}`,
    to: email,
    subject: "Your Verification Code",
    html: `
           <p>Your verification code is: <b>${code}</b></p>
           <p><a href='${process.env.CLIENT_URI}/verify-email/${token}'>Click here to verify</a></p>
           <p>This code will expire in 2 minutes.</p>
             `,
  });
  console.log("Verification email sent:", mail);

  return res.status(200).json({
    success: true,
    message:
      "User registered successfully, check your email for verification code",
    code: code, //remove before deployment
  });
};

const verifyEmail = async (req, res) => {
  const token = req.params.token;
  console.log("Token received for verification:", token);
  const { code } = req.body;

  const result = await authModel.verifyEmail(token, code);

  // getting email from tokens table
  const [rows] = await db.query("SELECT email FROM tokens WHERE token = ?", [
    token,
  ]);

  const email = rows[0]?.email;

  if (result === 0) {
    return res.status(400).json({ message: "Invalid code or email" });
  }
  //after verification doing isVerified true
  await db.query("UPDATE users SET isVerified = 1 WHERE email = ?", [email]);
  // after verifying code and token becomes null in token table
  await db.query(
    `UPDATE tokens SET verificationCode = NULL, token = NULL WHERE token=?`,
    [token]
  );

  res.status(200).json({
    success: true,
    message: "Email verified successfully!",
  });
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      message: "Email, password and role are required",
    });
  }

  let user;
  let rows;

  /* ================= ADMIN USERS ================= */
  if (role === "admin" || role === "superadmin") {
    [rows] = await db.query(
      `SELECT * FROM admin_users WHERE email = ? AND role = ?`,
      [email, role]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user = rows[0];

    // Generate tokens
    const accessToken = generateAuthToken(user);
    const refreshToken = generateRefreshToken(user);

    // Upsert into admin tokens table
    await db.query(
      `INSERT INTO tokens_admin (email, refreshToken)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE refreshToken = VALUES(refreshToken)`,
      [email, refreshToken]
    );

    // Send cookie
    res.cookie("authToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      accessToken,
    });
  } else if (role === "candidate" || role === "hr" || role === "company") {

  /* ================= NORMAL USERS ================= */
    rows = await authModel.getUserByEmail(email);

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user = rows[0];

    // Email verification check
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email" });
    }

    // HR approval check
    if (role === "hr" && !user.isApproved) {
      return res.status(403).json({
        message: "Your account is not approved by admin yet.",
      });
    }

    // Generate tokens
    const accessToken = generateAuthToken(user);
    const refreshToken = generateRefreshToken(user);

    // Upsert into normal users tokens table
    await db.query(
      `INSERT INTO tokens (email, refreshToken)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE refreshToken = VALUES(refreshToken)`,
      [email, refreshToken]
    );

    // Send cookie
    res.cookie("authToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      accessToken,
    });
  } else {

  /* ================= INVALID ROLE ================= */
    return res.status(400).json({ message: "Invalid role" });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.authToken; //from httpOnly cookie

  if (!refreshToken) {
    res.status(400).json({
      message: "No refresh token provided",
    });
  }

  // Remove refresh token from user DB
  await authModel.clearRefreshToken(refreshToken);

  //remove refresh token from admin DB
  await db.query(
    `UPDATE tokens_admin SET refreshToken = NULL WHERE refreshToken = ?`,
    [refreshToken]
  );

  //clear cookie
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  let user;
  let table; // to track which table to update token in

  // Check admin_users table
  const adminRows = await authModel.getAdminByEmail(email);

  if (adminRows.length) {
    user = adminRows[0];
    table = "tokens_admin"; // use admin tokens table
  } else {
    // Check users table
    const userRows = await authModel.getUserByEmail(email);

    if (!userRows.length) {
      return res.status(400).json({ message: "Email not found" });
    }

    user = userRows[0];
    table = "tokens"; // use normal users tokens table
  }

  //  Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  //  Upsert token into the correct token table
  await db.query(
    `INSERT INTO ${table} (email, resetToken, resetTokenExpiry)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE resetToken = VALUES(resetToken), resetTokenExpiry = VALUES(resetTokenExpiry)`,
    [email, resetToken, resetTokenExpiry]
  );

  //  Send reset link email
  await resend.emails.send({
    from: `YourApp <${process.env.DOMAIN}>`,
    to: email,
    subject: "Your reset password link",
    html: `<p>Click the link below to reset your password:</p>
           <p><a href='${process.env.CLIENT_URI}/reset-password/${resetToken}'>Reset Link</a></p>`,
  });

  res.status(200).json({
    success: true,
    message: `Reset link sent to your email. Check it!`,
  });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  let user;
  let userType;
  let email;

  // Check admin token table
  const [adminRows] = await db.query(
    `SELECT * FROM tokens_admin WHERE resetToken = ?`,
    [resetToken]
  );

  if (adminRows.length) {
    user = adminRows[0];
    userType = "admin";
    email = user.email;
  } else {
    //  Check normal users token table
    const [userRows] = await db.query(
      `SELECT * FROM tokens WHERE resetToken = ?`,
      [resetToken]
    );

    if (!userRows.length) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user = userRows[0];
    userType = "user";
    email = user.email;
  }

  // Check if token has expired
  if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
    return res.status(400).json({ message: "Token expired" });
  }

  //  Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password in the correct table
  if (userType === "admin") {
    await db.query(`UPDATE admin_users SET password = ? WHERE email = ?`, [
      hashedPassword,
      email,
    ]);
  } else {
    await db.query(`UPDATE users SET password = ? WHERE email = ?`, [
      hashedPassword,
      email,
    ]);
  }

  //  Clear the reset token
  const tokenTable = userType === "admin" ? "tokens_admin" : "tokens";
  await db.query(
    `UPDATE ${tokenTable} SET resetToken = NULL, resetTokenExpiry = NULL WHERE email = ?`,
    [email]
  );

  res.status(200).json({ message: "Password reset successfully" });
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.authToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const userId = decoded.id;

  let user;
  let table;
  let tokenTable;

  // Check admin_users
  const [adminRows] = await db.query(`SELECT * FROM admin_users WHERE id = ?`, [
    userId,
  ]);

  if (adminRows.length) {
    user = adminRows[0];
    table = "admin_users";
    tokenTable = "tokens_admin";
  } else {
    //  Check normal users
    const [userRows] = await db.query(`SELECT * FROM users WHERE id = ?`, [
      userId,
    ]);

    if (!userRows.length) {
      return res.status(401).json({ message: "User not found" });
    }

    user = userRows[0];
    table = "users";
    tokenTable = "tokens";
  }

  // Check DB for refresh token in the correct token table
  const [tokenRow] = await db.query(
    `SELECT * FROM ${tokenTable} WHERE refreshToken = ? AND email = ?`,
    [refreshToken, user.email]
  );

  if (!tokenRow.length) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  // Generate new access token
  const newAccessToken = generateAuthToken({
    id: user.id,
    email: user.email,
    role: user.role,
    admin_role_id: user.admin_role_id || null,
  });

  res.json({
    accessToken: newAccessToken,
  });
};

module.exports = {
  signup,
  verifyEmail,
  login,
  logout,
  forgetPassword,
  resetPassword,
  refreshAccessToken,
};

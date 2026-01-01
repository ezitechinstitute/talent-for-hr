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
  console.log(token);
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

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  // Check user email
  const existingUser = await authModel.checkExistingUser(email);
  if (!existingUser) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  //getting data from database using email
  const user = await authModel.getUserByEmail(email);

  //check password(comparing)
  const hashedPassword = user?.password;

  const isMatch = await bcrypt.compare(password, hashedPassword);
  if (!isMatch) {
    return res.status(400).json({ message: "password is incorrect" });
  }

  if(user.role === 'admin' &&!user.admin_role_id){
   return res.status(403).json({
    message:"Admin role not assigned yet"
   })
  }

  const accessToken = generateAuthToken(user);
  const refreshToken = generateRefreshToken(user);

  await db.query(`UPDATE tokens SET refreshToken=? WHERE email=?`, [
    refreshToken,
    email,
  ]);
  //if hr account is not approved
  if (role === "hr" && !user.isApproved) {
    return res.status(403).json({
      message: "Your account is not approved by admin yet.",
    });
  }

  res.cookie("authToken", refreshToken, {
    httpOnly: true, // Cannot be accessed by JS (security)
    secure: true, // Send only over HTTPS
    sameSite: "Lax", // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: "Login successfully",
    user,
    accessToken,
  });
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.authToken; //from httpOnly cookie

  if (!refreshToken) {
    res.status(400).json({
      message: "No refresh token provided",
    });
  }

  // Remove refresh token from DB
  await authModel.clearRefreshToken(refreshToken);

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

//forgot password
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  // Check user email
  const existingUser = await authModel.checkExistingUser(email);
  if (!existingUser) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const user = await authModel.getUserByEmail(email);

  //Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Expiry: 1 hour from now
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  //setting resetToken and expirytime
  await db.query(
    "UPDATE tokens SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?",
    [resetToken, resetTokenExpiry, email]
  );

  //reset password link
  const mail = await resend.emails.send({
    //add website domain here and verify it in resend website
    from: `YourApp ${process.env.DOMAIN}`,
    to: email,
    subject: "Your reset password link",
    html: `<p>Click the link below to reset your password<p>
      <p><a href='${process.env.CLIENT_URI}/reset-password/${resetToken}'>Reset Link</a>`,
  });

  res.status(200).json({
    success: true,
    message: "Reset link sent to your mail check it",
  });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;

  const { password } = req.body;

  //getting user info
  const [rows] = await db.query(`SELECT * FROM tokens WHERE resetToken=?`, [
    resetToken,
  ]);
  const user = rows[0];

  //check resetTokenExpiry
  if (new Date(user.resetTokenExpiry) < new Date()) {
    return res.status(400).json({ message: "Token expired" });
  }

  //hashing new password
  const genSalt = 10;
  const hashedPassword = await bcrypt.hash(password, genSalt);

  //password updation
  await authModel.updatePassword(hashedPassword, user.email);

  res.status(200).json({
    message: "password reset successfully",
  });
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.authToken;
  if (!refreshToken) {
    res.status(401).json({
      message: "No refresh token",
    });
  }

  //verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

  //check db for token existence
  const [rows] = await db.query("SELECT * FROM users WHERE id = ? ", [
    decoded.id,
  ]);
  const [refresh_Token] = await db.query(
    `SELECT * FROM tokens WHERE refreshToken=?`,
    [refreshToken]
  );
  if (refresh_Token.length === 0)
    return res.status(401).json({
      message: "Invalid refresh token",
    });

  //generate new access token
  const newAccessToken = generateAuthToken({
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    admin_role_id: decoded.role_id,
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

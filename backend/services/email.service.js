const nodemailer = require("nodemailer");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  return transporter.sendMail({
    from: `"Talent For HR" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};

module.exports = { sendEmail };

const { Resend } = require("resend");
require("dotenv").config();

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY missing");
}

if (!process.env.DOMAIN) {
  throw new Error("EMAIL_FROM missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);
let queue = Promise.resolve();

const sendEmail = ({ to, subject, html }) => {
  queue = queue.then(async () => {
    await new Promise((r) => setTimeout(r, 700));
    return resend.emails.send({
      from: process.env.DOMAIN,
      to,
      subject,
      html,
    });
  });

  return queue;
};

module.exports = { sendEmail };

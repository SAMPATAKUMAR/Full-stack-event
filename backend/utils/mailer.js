// utils/mailer.js
import nodemailer from "nodemailer";

const { MAIL_USER, MAIL_PASS, FROM_EMAIL } = process.env;

let transporter = null;

if (MAIL_USER && MAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  });

  transporter.verify()
    .then(() => console.log("Mailer ready (Gmail)."))
    .catch((err) => {
      console.warn("Mailer verify failed:", err.message);
      transporter = null;
    });
} else {
  console.warn("Mailer not configured. Emails will be logged to console.");
}

export async function sendMail({ to, subject, html, text }) {
  if (!to) {
    console.warn("sendMail called without 'to' address");
    return;
  }
  if (!transporter) {
    console.log("=== sendMail (SIMULATED) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Text:", text || html);
    console.log("===========================");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL || MAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Failed to send email:", err.message);
    throw err;
  }
}

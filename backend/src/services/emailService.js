const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"SkillForge" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Reset Your Password</h1>
      <p>You requested to reset your password for SkillForge.</p>
      <p>Click the button below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px;">
        Reset Password
      </a>
      <p style="margin-top: 20px;">This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request - SkillForge',
    html,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail };
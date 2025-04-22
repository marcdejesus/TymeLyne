const nodemailer = require('nodemailer');

// Configure transport using environment variables
const createTransporter = async () => {
  // For production, use actual SMTP details from environment variables
  // For development, can use Ethereal or other test service
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
};

/**
 * Send an email verification link to a new user
 * @param {string} to - Recipient email
 * @param {string} username - Username of the recipient
 * @param {string} verificationToken - Token for email verification
 * @returns {Promise<boolean>} - Whether email was sent successfully
 */
const sendVerificationEmail = async (to, username, verificationToken) => {
  try {
    const transporter = await createTransporter();
    
    // Build verification URL - this should match your frontend route
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    // Define email content
    const mailOptions = {
      from: `"TymeLyne" <${process.env.SMTP_USER || 'noreply@tymelyne.com'}>`,
      to,
      subject: 'Verify Your TymeLyne Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Welcome to TymeLyne!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for registering with TymeLyne. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #26b8a2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If you didn't create an account with TymeLyne, you can safely ignore this email.</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>Best regards,<br>The TymeLyne Team</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
}; 
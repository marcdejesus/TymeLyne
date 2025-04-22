const nodemailer = require('nodemailer');

// Configure transport using environment variables
const createTransporter = async () => {
  console.log('⚙️ Creating email transporter with configuration:', {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ? '[REDACTED EMAIL]' : undefined
  });

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

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
  } catch (error) {
    console.error('🔴 SMTP connection verification failed:', error.message);
    // Still return the transporter as the connection might work for sending
  }

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
  console.log(`📧 Attempting to send verification email to ${to}`);
  
  try {
    const transporter = await createTransporter();
    
    // Get the frontendUrl from environment variables with a safe fallback
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8082';
    
    // Create a verification URL that works with the mobile app
    // For mobile verification, we need to use the API directly since deep linking might not be set up
    const apiUrl = frontendUrl.replace(':8082', ':5001');
    
    // Direct API verification link (direct to backend)
    const apiVerificationUrl = `${apiUrl}/api/auth/verify/${verificationToken}`;
    
    console.log(`🔗 Verification URL generated: ${apiVerificationUrl}`);
    
    // Define email content
    const mailOptions = {
      from: `"TymeLyne" <${process.env.SMTP_USER || 'tymelyne.authentication@gmail.com'}>`,
      to,
      subject: 'Verify Your TymeLyne Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Welcome to TymeLyne!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for registering with TymeLyne. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${apiVerificationUrl}" style="background-color: #26b8a2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          
          <p>If you're opening this email on your mobile device, just click the link above.</p>
          <p>After verification, return to the app and log in with your credentials.</p>
          
          <p style="margin-top: 20px;">If you didn't create an account with TymeLyne, you can safely ignore this email.</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>Best regards,<br>The TymeLyne Team</p>
        </div>
      `,
    };

    console.log('⚙️ Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      recipient: to,
      response: info.response
    });
    
    return true;
  } catch (error) {
    console.error('🔴 EMAIL SENDING ERROR:', error);
    console.error('Details:', {
      recipient: to,
      username,
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
}; 
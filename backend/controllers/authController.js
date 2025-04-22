const Profile = require('../models/profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');

// Register a new user
exports.register = async (req, res) => {
  console.log('🔶 REGISTER ATTEMPT:', { email: req.body.email, username: req.body.username });
  
  try {
    const { email, username, password, fName, lName } = req.body;

    // Check if user already exists
    let existingUser = await Profile.findOne({ email });
    if (existingUser) {
      console.log('🔴 REGISTER FAILED: Email already exists', { email });
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    existingUser = await Profile.findOne({ username });
    if (existingUser) {
      console.log('🔴 REGISTER FAILED: Username already taken', { username });
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('⚙️ Creating new user profile', { email, username });
    
    // Create new user
    const newUser = new Profile({
      user_id: uuidv4(),
      email,
      username,
      password: hashedPassword,
      fName,
      lName,
      created_at: new Date(),
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      is_verified: false
    });

    await newUser.save();
    console.log('✅ USER CREATED in database', { 
      userId: newUser.user_id, 
      email, 
      username, 
      isVerified: false,
      verificationTokenExpires
    });

    // Send verification email
    console.log('⚙️ Sending verification email to', email);
    const emailSent = await sendVerificationEmail(
      email,
      username,
      verificationToken
    );
    
    console.log('📧 Verification email status:', emailSent ? 'SENT ✅' : 'FAILED ❌', { email });

    // Don't return a JWT token - user must verify email first
    
    res.status(201).json({
      success: true,
      needsVerification: true,
      message: emailSent 
        ? 'Registration successful. Please check your email to verify your account before logging in.' 
        : 'Registration successful but verification email could not be sent. Please contact support.',
      user: {
        email: newUser.email,
        username: newUser.username,
        is_verified: false
      }
    });
  } catch (error) {
    console.error('🔴 REGISTER ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  console.log('🔶 LOGIN ATTEMPT:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await Profile.findOne({ email }).select('+password');
    if (!user) {
      console.log('🔴 LOGIN FAILED: User not found', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('🔴 LOGIN FAILED: Password incorrect', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.is_verified) {
      console.log('🔴 LOGIN FAILED: Email not verified', { 
        email, 
        userId: user.user_id, 
        verificationTokenExpires: user.verification_token_expires
      });
      
      return res.status(401).json({ 
        message: 'Email not verified. Please verify your email before logging in.',
        needsVerification: true
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ LOGIN SUCCESSFUL', { 
      userId: user.user_id, 
      email, 
      username: user.username 
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        fName: user.fName,
        lName: user.lName,
        profile_picture: user.profile_picture,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('🔴 LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  console.log('🔶 EMAIL VERIFICATION ATTEMPT:', { token: req.params.token });
  
  try {
    const { token } = req.params;

    // Find user with verification token that hasn't expired
    const user = await Profile.findOne({
      verification_token: token,
      verification_token_expires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('🔴 VERIFICATION FAILED: Invalid or expired token', { token });
      
      // Check if request is coming from a browser (Accept header contains text/html)
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Email Verification Failed</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 40px 20px; color: #333; }
              h1 { color: #D35C34; }
              .container { max-width: 600px; margin: 0 auto; }
              .message { margin: 20px 0; line-height: 1.5; }
              .error { color: #D35C34; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verification Failed</h1>
              <p class="message error">The verification link is invalid or has expired.</p>
              <p class="message">Please request a new verification email through the app.</p>
            </div>
          </body>
          </html>
        `);
      }
      
      return res.status(400).json({ 
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.is_verified = true;
    user.verification_token = undefined;
    user.verification_token_expires = undefined;
    await user.save();

    console.log('✅ EMAIL VERIFIED SUCCESSFULLY', { 
      userId: user.user_id, 
      email: user.email,
      username: user.username
    });

    // Return HTML for browser requests
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px 20px; color: #333; }
            h1 { color: #4CAF50; }
            .container { max-width: 600px; margin: 0 auto; }
            .message { margin: 20px 0; line-height: 1.5; }
            .success { color: #4CAF50; font-size: 100px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <p class="success">✓</p>
            <h1>Email Verified Successfully</h1>
            <p class="message">Your email has been verified. You can now log in to the TymeLyne app.</p>
            <p class="message">Please return to the app and log in with your credentials.</p>
          </div>
        </body>
        </html>
      `);
    }

    res.status(200).json({
      message: 'Email verification successful. You can now log in.',
      verified: true
    });
  } catch (error) {
    console.error('🔴 VERIFICATION ERROR:', error);
    
    // HTML response for browser requests
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px 20px; color: #333; }
            h1 { color: #D35C34; }
            .container { max-width: 600px; margin: 0 auto; }
            .message { margin: 20px 0; line-height: 1.5; }
            .error { color: #D35C34; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verification Error</h1>
            <p class="message error">An error occurred during verification.</p>
            <p class="message">Please try again or request a new verification email through the app.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  console.log('🔶 RESEND VERIFICATION EMAIL ATTEMPT:', { email: req.body.email });
  
  try {
    const { email } = req.body;

    // Find user by email
    const user = await Profile.findOne({ email });
    if (!user) {
      console.log('🔴 RESEND FAILED: User not found', { email });
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.is_verified) {
      console.log('ℹ️ RESEND UNNECESSARY: Already verified', { 
        email, 
        userId: user.user_id 
      });
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user
    user.verification_token = verificationToken;
    user.verification_token_expires = verificationTokenExpires;
    await user.save();
    
    console.log('⚙️ Verification token updated', { 
      userId: user.user_id, 
      email,
      verificationTokenExpires
    });

    // Send verification email
    console.log('⚙️ Resending verification email to', email);
    const emailSent = await sendVerificationEmail(
      user.email,
      user.username,
      verificationToken
    );

    console.log('📧 Verification email status:', emailSent ? 'SENT ✅' : 'FAILED ❌', { email });

    if (emailSent) {
      res.status(200).json({ message: 'Verification email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('🔴 RESEND VERIFICATION ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  console.log('🔶 GET CURRENT USER:', { userId: req.user.id });
  
  try {
    const user = await Profile.findOne({ user_id: req.user.id });
    if (!user) {
      console.log('🔴 GET USER FAILED: User not found', { userId: req.user.id });
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ USER PROFILE RETRIEVED', { 
      userId: user.user_id, 
      email: user.email, 
      username: user.username,
      isVerified: user.is_verified
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('🔴 GET CURRENT USER ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
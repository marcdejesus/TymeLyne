const nodemailer = require('nodemailer');
const emailService = require('../../utils/emailService');

// Mock nodemailer
jest.mock('nodemailer');

describe('Email Service', () => {
  let mockTransporter;
  let originalEnv;
  
  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
    
    // Mock environment variables
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASSWORD = 'testpassword';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    
    // Setup mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'mock-message-id'
      })
    };
    
    // Mock nodemailer to return our mock transporter
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });
  
  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    jest.clearAllMocks();
  });
  
  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      // Arrange
      const email = 'user@example.com';
      const username = 'testuser';
      const verificationToken = 'test-token-123';
      
      // Act
      const result = await emailService.sendVerificationEmail(email, username, verificationToken);
      
      // Assert
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: '587',
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'testpassword'
        }
      });
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: expect.stringContaining('TymeLyne'),
        to: email,
        subject: expect.stringContaining('Verify'),
        html: expect.stringContaining(username)
      }));
      
      expect(result).toBe(true);
    });
    
    it('should handle errors and return false', async () => {
      // Arrange
      const email = 'user@example.com';
      const username = 'testuser';
      const verificationToken = 'test-token-123';
      
      // Mock error in sendMail
      const sendError = new Error('Failed to send email');
      mockTransporter.sendMail.mockRejectedValueOnce(sendError);
      
      // Act
      const result = await emailService.sendVerificationEmail(email, username, verificationToken);
      
      // Assert
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(result).toBe(false);
    });
    
    it('should use default values when environment variables are not set', async () => {
      // Arrange
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.FRONTEND_URL;
      
      const email = 'user@example.com';
      const username = 'testuser';
      const verificationToken = 'test-token-123';
      
      // Act
      const result = await emailService.sendVerificationEmail(email, username, verificationToken);
      
      // Assert
      expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
        host: 'smtp.ethereal.email',  // Default value
      }));
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: expect.stringContaining('noreply@tymelyne.com'),  // Default value
        html: expect.stringContaining('http://localhost:3000/verify-email')  // Default URL
      }));
      
      expect(result).toBe(true);
    });
  });
}); 
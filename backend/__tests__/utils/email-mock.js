// Mock for email service functions
const nodemailer = require('nodemailer');

// Create nodemailer mock for transporter
const mockTransporter = {
  sendMail: jest.fn().mockImplementation((mailOptions) => {
    return Promise.resolve({
      messageId: 'mock-message-id',
      envelope: {
        from: mailOptions.from,
        to: [mailOptions.to]
      }
    });
  }),
  verify: jest.fn().mockResolvedValue(true),
  close: jest.fn()
};

// Mock the createTransport function
nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);

const emailServiceMock = {
  sendVerificationEmail: jest.fn().mockImplementation(async (to, username, token, baseUrl) => {
    return true; // Simulate successful email sending
  }),
  createTransporter: jest.fn().mockReturnValue(mockTransporter)
};

module.exports = emailServiceMock; 
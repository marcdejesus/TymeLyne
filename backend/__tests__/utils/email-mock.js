// Mock for email service functions
const emailServiceMock = {
  sendVerificationEmail: jest.fn().mockImplementation(async () => {
    return true; // Simulate successful email sending
  })
};

module.exports = emailServiceMock; 
const mockVerifyIdToken = jest.fn();

const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
};

const admin = {
  initializeApp: jest.fn(() => ({})),
  credential: { cert: jest.fn() },
  auth: jest.fn(() => mockAuth),
};

admin.__mockAuth = mockAuth;

module.exports = admin;

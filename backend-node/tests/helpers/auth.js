const User = require('../../app_api/models/User');

const createTestUser = async (overrides = {}) => {
  return User.create({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'user',
    ...overrides,
  });
};

module.exports = { createTestUser };

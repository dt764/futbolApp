const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/futbolapp-dev',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
  },
  test: {
    mongoUri: process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/futbolapp-test',
    apiUrl: process.env.API_URL_TEST || 'http://localhost:3001',
  },
  production: {
    mongoUri: process.env.MONGO_URI,
    apiUrl: process.env.API_URL,
  },
};

module.exports = config[env];

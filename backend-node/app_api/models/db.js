const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

mongoose.connection.on('error', err => {
  logger.error(`Error crítico de MongoDB: ${err}`);
});
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB desconectado');
});
mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconectado');
});

const connectDB = async () => {
  const mongoURI = config.mongoUri;

  if (!mongoURI) {
    throw new Error('La variable MONGO_URI no está definida en el entorno.');
  }

  logger.info('Intentando conectar a:', mongoURI.replace(/:([^@]+)@/, ':****@'));

  const conn = await mongoose.connect(mongoURI, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  logger.info(`MongoDB Conectado: ${conn.connection.host}`);
};

module.exports = connectDB;
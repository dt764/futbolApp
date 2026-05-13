const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const config = require('../config');

mongoose.connection.on('error', err => {
  console.error(`❌ Error crítico de MongoDB: ${err}`);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB desconectado');
});
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconectado');
});

const connectDB = async () => {
  const mongoURI = config.mongoUri;

  if (!mongoURI) {
    throw new Error('La variable MONGO_URI no está definida en el entorno.');
  }

  console.log('🔍 Intentando conectar a:', mongoURI.replace(/:([^@]+)@/, ':****@'));

  const conn = await mongoose.connect(mongoURI, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
};

module.exports = connectDB;
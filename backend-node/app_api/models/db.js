const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('La variable MONGO_URI no está definida en el entorno.');
    }

    // Forzar IPv4
    dns.setDefaultResultOrder('ipv4first');

    // Log para depuración (quítalo después)
    console.log('🔍 Intentando conectar a:', mongoURI.replace(/:([^@]+)@/, ':****@'));

    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
    });

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error(`❌ Error crítico de MongoDB tras la conexión: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB se ha desconectado');
    });

  } catch (error) {
    console.error(`❌ Fallo en la conexión inicial a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
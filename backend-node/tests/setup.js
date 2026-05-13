const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Antes de todos los tests, arranca el servidor en memoria
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Cerramos cualquier conexión previa si existe
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

// Después de todos los tests, limpia y cierra
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
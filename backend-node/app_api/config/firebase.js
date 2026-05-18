const admin = require('firebase-admin');
const path = require('path');

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  serviceAccount = require(filePath);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
  const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf-8');
  serviceAccount = JSON.parse(decoded);
}

if (!serviceAccount) {
  console.warn('Firebase no configurado — define FIREBASE_SERVICE_ACCOUNT_PATH o FIREBASE_SERVICE_ACCOUNT en .env');
}

let firebaseApp = null;

if (serviceAccount) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const getAuth = () => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado. Revisa FIREBASE_SERVICE_ACCOUNT.');
  }
  return admin.auth();
};

module.exports = { admin, getAuth };

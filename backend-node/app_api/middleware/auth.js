const { getAuth } = require('../config/firebase');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const idToken = header.split(' ')[1];

  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);

    let user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        email: decoded.email || '',
        displayName: decoded.name || decoded.email || '',
      });
    }

    req.user = user;
    req.firebaseUid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };

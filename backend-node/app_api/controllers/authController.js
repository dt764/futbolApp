const { getAuth } = require('../config/firebase');
const User = require('../models/User');

const login = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'idToken es requerido' });
  }

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

    res.json({
      user: { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch {
    res.status(401).json({ error: 'Token de Firebase inválido o expirado' });
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, me };

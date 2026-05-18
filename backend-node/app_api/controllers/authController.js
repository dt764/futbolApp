const { getAuth } = require('../config/firebase');
const User = require('../models/User');

const signInWithFirebase = async (email, password) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('FIREBASE_API_KEY no configurada en .env');
  }

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Error al autenticar con Firebase');
  }

  return data.idToken;
};

const login = async (req, res) => {
  const { idToken, email, password } = req.body;

  try {
    let token = idToken;

    if (!token) {
      if (!email || !password) {
        return res.status(400).json({ error: 'Requiere idToken o email+password' });
      }
      token = await signInWithFirebase(email, password);
    }

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);

    let user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        email: decoded.email || '',
        displayName: decoded.name || decoded.email || '',
      });
    }

    res.json({
      token,
      user: { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (err) {
    if (err.message === 'FIREBASE_API_KEY no configurada en .env') {
      return res.status(500).json({ error: err.message });
    }
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, me };

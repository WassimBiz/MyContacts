const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function isValidEmail(email = '') { return /.+@.+\..+/.test(email); }

async function registerUser(email, password) {
  if (!isValidEmail(email)) throw Object.assign(new Error('Invalid email'), { status: 400 });
  if (typeof password !== 'string' || password.length < 8) {
    throw Object.assign(new Error('Password must be at least 8 chars'), { status: 400 });
  }

  const exists = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (exists) throw Object.assign(new Error('Email already used'), { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  return user.toJSON(); // nettoyé par toJSON du modèle
}

async function loginUser(email, password) {
  const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: user.toJSON() };
}

module.exports = { registerUser, loginUser };

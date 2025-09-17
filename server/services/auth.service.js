const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('[ENV] JWT_SECRET is', process.env.JWT_SECRET ? 'OK' : 'MISSING'); // DEBUG

async function registerUser(email, password) {
  if (!email || !password) {
    throw { status: 400, message: 'Email and password required' };
  }

  const exists = await User.findOne({ email: (email || '').toLowerCase().trim() });
  if (exists) throw { status: 409, message: 'Email already used' };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  // Retour simple (le controller génère le token)
  return {
    id: user._id.toString(),
    email: user.email,
    createdAt: user.createdAt
  };
}

async function loginUser(email, password) {
  if (!email || !password) {
    throw { status: 400, message: 'Email and password required' };
  }
  const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt
    }
  };
}

module.exports = { registerUser, loginUser };

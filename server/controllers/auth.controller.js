const { registerUser, loginUser } = require('../services/auth.service');
const jwt = require('jsonwebtoken');

async function register(req, res) {
  try {
    const { email = '', password = '' } = req.body || {};
    console.log('[TEST] Register with', email); // DEBUG

    const user = await registerUser(email, password);

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    if (err && err.code === 11000) {
      return res.status(409).json({ error: { message: 'Email already used', status: 409 } });
    }
    return res.status(err.status || 500).json({ error: { message: err.message, status: err.status || 500 } });
  }
}

async function login(req, res) {
  try {
    const { email = '', password = '' } = req.body || {};
    console.log('[TEST] Login with', email); // DEBUG

    const data = await loginUser(email, password);
    return res.json(data); // { token, user }
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(err.status || 500).json({ error: { message: err.message, status: err.status || 500 } });
  }
}

module.exports = { register, login };

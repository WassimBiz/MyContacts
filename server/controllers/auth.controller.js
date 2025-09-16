const { registerUser, loginUser } = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { email = '', password = '' } = req.body || {};
    const user = await registerUser(email, password);
    return res.status(201).json(user);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: { message: 'Email already used', status: 409 } });
    }
    return res.status(err.status || 500).json({ error: { message: err.message, status: err.status || 500 } });
  }
}

async function login(req, res, next) {
  try {
    const { email = '', password = '' } = req.body || {};
    const data = await loginUser(email, password);
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ error: { message: err.message, status: err.status || 500 } });
  }
}

module.exports = { register, login };

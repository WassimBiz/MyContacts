const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body || {};
    if (!/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: { message: 'Invalid email', status: 400 } });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: { message: 'Password must be at least 8 chars', status: 400 } });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (exists) {
      return res.status(409).json({ error: { message: 'Email already used', status: 409 } });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email, passwordHash });

    return res.status(201).json(user.toJSON());
  } catch (err) {
    // Conflit d'index unique (sécurité ceinture+bretelles)
    if (err && err.code === 11000) {
      return res.status(409).json({ error: { message: 'Email already used', status: 409 } });
    }
    return next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body || {};
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid credentials', status: 401 } });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: { message: 'Invalid credentials', status: 401 } });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: user.toJSON() });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

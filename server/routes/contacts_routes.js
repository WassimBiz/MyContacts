const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const Contact = require('../models/Contact');

const router = express.Router();

// Toutes les routes contacts sont protégées
router.use(requireAuth);

// GET /contacts?q=&limit=&offset=
router.get('/', async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { q = '', limit = '20', offset = '0' } = req.query;

    const flt = { owner };
    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      flt.$or = [{ firstName: rx }, { lastName: rx }, { phone: rx }];
    }

    const lim = Math.min(parseInt(limit, 10) || 20, 50);
    const off = parseInt(offset, 10) || 0;

    const [items, total] = await Promise.all([
      Contact.find(flt).sort({ createdAt: -1 }).skip(off).limit(lim).lean(),
      Contact.countDocuments(flt)
    ]);

    return res.json({ total, limit: lim, offset: off, items });
  } catch (err) {
    return next(err);
  }
});

// POST /contacts
router.post('/', async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { firstName = '', lastName = '', phone = '' } = req.body || {};

    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      return res.status(400).json({ error: { message: 'firstName, lastName, phone are required', status: 400 } });
    }
    // Bonus validation phone length 10–20
    if (phone.length < 10 || phone.length > 20) {
      return res.status(400).json({ error: { message: 'phone must be 10 to 20 characters', status: 400 } });
    }

    const created = await Contact.create({ firstName, lastName, phone, owner });
    return res.status(201).json(created.toJSON());
  } catch (err) {
    return next(err);
  }
});

// PATCH /contacts/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { message: 'Invalid contact id', status: 400 } });
    }

    const allowed = ['firstName', 'lastName', 'phone'];
    const patch = {};
    for (const k of allowed) {
      if (k in req.body) patch[k] = req.body[k];
    }
    if ('phone' in patch && (patch.phone.length < 10 || patch.phone.length > 20)) {
      return res.status(400).json({ error: { message: 'phone must be 10 to 20 characters', status: 400 } });
    }

    const updated = await Contact.findOneAndUpdate(
      { _id: id, owner },
      { $set: patch },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: { message: 'Contact not found', status: 404 } });
    }
    return res.json(updated.toJSON());
  } catch (err) {
    return next(err);
  }
});

// DELETE /contacts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { message: 'Invalid contact id', status: 400 } });
    }

    const deleted = await Contact.findOneAndDelete({ _id: id, owner });
    if (!deleted) {
      return res.status(404).json({ error: { message: 'Contact not found', status: 404 } });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

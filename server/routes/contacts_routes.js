const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const Contact = require('../models/Contact');

const router = express.Router();

router.use(requireAuth);

// Helper de mapping
const toDto = (doc) => ({
  id: doc._id.toString(),
  firstName: doc.firstName,
  lastName: doc.lastName,
  phone: doc.phone,
  owner: doc.owner.toString(),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

// List
router.get('/', async (req, res) => {
  const { q = '', limit = 20, offset = 0 } = req.query;
  const lim = Math.min(parseInt(limit, 10) || 20, 50);
  const off = parseInt(offset, 10) || 0;

  const flt = { owner: req.user.id };
  if (q) {
    const rx = new RegExp(String(q).trim(), 'i');
    flt.$or = [{ firstName: rx }, { lastName: rx }, { phone: rx }];
  }

  const [items, total] = await Promise.all([
    Contact.find(flt).sort({ createdAt: -1 }).skip(off).limit(lim),
    Contact.countDocuments(flt)
  ]);

  res.json({ total, limit: lim, offset: off, items: items.map(toDto) });
});

// Create
router.post('/', async (req, res) => {
  const { firstName = '', lastName = '', phone = '' } = req.body || {};
  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ error: { message: 'Missing fields', status: 400 } });
  }
  if (phone.length < 10 || phone.length > 20) {
    return res.status(400).json({ error: { message: 'phone must be 10 to 20 chars', status: 400 } });
  }
  const created = await Contact.create({ firstName, lastName, phone, owner: req.user.id });
  return res.status(201).json(toDto(created));
});

// Patch (single)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: { message: 'Invalid contact id', status: 400 } });
  }
  if (req.body.phone && (req.body.phone.length < 10 || req.body.phone.length > 20)) {
    return res.status(400).json({ error: { message: 'phone must be 10 to 20 chars', status: 400 } });
  }
  const updated = await Contact.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { $set: req.body || {} },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: { message: 'Contact not found', status: 404 } });
  return res.json(toDto(updated));
});

// Bulk patch: [{ id, patch }, ...]
router.patch('/bulk', async (req, res) => {
  const ops = Array.isArray(req.body) ? req.body : [];
  if (!ops.length) {
    return res.status(400).json({ error: { message: 'Body must be a non-empty array', status: 400 } });
  }

  const results = [];
  for (const { id, patch } of ops) {
    if (!id || !patch || !mongoose.Types.ObjectId.isValid(id)) {
      results.push({ id, status: 400, message: 'Invalid id or patch' });
      continue;
    }
    if (patch.phone && (patch.phone.length < 10 || patch.phone.length > 20)) {
      results.push({ id, status: 400, message: 'phone must be 10 to 20 chars' });
      continue;
    }
    const updated = await Contact.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { $set: patch },
      { new: true }
    );
    if (!updated) {
      results.push({ id, status: 404, message: 'Contact not found' });
    } else {
      results.push({ id, status: 200, item: toDto(updated) });
    }
  }

  return res.json({ results });
});

// Delete
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: { message: 'Invalid contact id', status: 400 } });
  }
  const deleted = await Contact.findOneAndDelete({ _id: id, owner: req.user.id });
  if (!deleted) return res.status(404).json({ error: { message: 'Contact not found', status: 404 } });
  return res.status(204).send();
});

module.exports = router;

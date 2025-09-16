const mongoose = require('mongoose');
const Contact = require('../models/Contact');

function buildFilter(owner, q) {
  const flt = { owner };
  if (q) {
    const rx = new RegExp(String(q).trim(), 'i');
    flt.$or = [{ firstName: rx }, { lastName: rx }, { phone: rx }];
  }
  return flt;
}

async function listContacts(owner, q, limit = 20, offset = 0) {
  const lim = Math.min(parseInt(limit, 10) || 20, 50);
  const off = parseInt(offset, 10) || 0;

  const flt = buildFilter(owner, q);
  const [docs, total] = await Promise.all([
    Contact.find(flt).sort({ createdAt: -1 }).skip(off).limit(lim),
    Contact.countDocuments(flt)
  ]);

  return { total, limit: lim, offset: off, items: docs.map(d => d.toJSON()) };
}

async function createContact(owner, { firstName = '', lastName = '', phone = '' }) {
  if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
    throw Object.assign(new Error('firstName, lastName, phone are required'), { status: 400 });
  }
  if (phone.length < 10 || phone.length > 20) {
    throw Object.assign(new Error('phone must be 10 to 20 characters'), { status: 400 });
  }
  const created = await Contact.create({ firstName, lastName, phone, owner });
  return created.toJSON();
}

async function updateContact(owner, id, patch) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Object.assign(new Error('Invalid contact id'), { status: 400 });
  }
  if (patch.phone && (patch.phone.length < 10 || patch.phone.length > 20)) {
    throw Object.assign(new Error('phone must be 10 to 20 characters'), { status: 400 });
  }
  const updated = await Contact.findOneAndUpdate({ _id: id, owner }, { $set: patch }, { new: true });
  if (!updated) throw Object.assign(new Error('Contact not found'), { status: 404 });
  return updated.toJSON();
}

async function deleteContact(owner, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Object.assign(new Error('Invalid contact id'), { status: 400 });
  }
  const deleted = await Contact.findOneAndDelete({ _id: id, owner });
  if (!deleted) throw Object.assign(new Error('Contact not found'), { status: 404 });
  return true;
}

module.exports = { listContacts, createContact, updateContact, deleteContact };

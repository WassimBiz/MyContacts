const {
  listContacts,
  createContact,
  updateContact,
  deleteContact
} = require('../services/contacts.service');

async function list(req, res) {
  const { q = '', limit, offset } = req.query;
  const result = await listContacts(req.user.id, q, limit, offset);
  return res.json(result);
}

async function create(req, res) {
  const created = await createContact(req.user.id, req.body || {});
  return res.status(201).json(created);
}

async function update(req, res) {
  const updated = await updateContact(req.user.id, req.params.id, req.body || {});
  return res.json(updated);
}

async function remove(req, res) {
  await deleteContact(req.user.id, req.params.id);
  return res.status(204).send();
}

module.exports = { list, create, update, remove };

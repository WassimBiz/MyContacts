const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const authRoutes = require('./routes/auth.routes');
const contactsRoutes = require('./routes/contacts_routes');
const requireAuth = require('./middlewares/requireAuth');

const app = express();

// CORS (front local par défaut)
const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({ origin: allowed }));
app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth
app.use('/auth', authRoutes);

// Current user
app.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});

// Contacts (protégé)
app.use('/contacts', contactsRoutes);

// Handler d'erreurs JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  return res.status(status).json({
    error: { message: err.message || 'Internal Server Error', status }
  });
});

module.exports = app;

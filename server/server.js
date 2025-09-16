require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const requireAuth = require('./middlewares/requireAuth');

const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contacts_routes');

const app = express();
const port = 4000; // fixé comme demandé

// Middlewares
app.use(express.json());
app.use(cors());

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Docs Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);
app.get('/me', requireAuth, (req, res) => {
  return res.json({ id: req.user.id, email: req.user.email });
});
app.use('/contacts', contactRoutes);

// Handler d'erreurs JSON uniforme
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  return res.status(status).json({
    error: { message: err.message || 'Internal Server Error', status, details: err.details || null }
  });
});

// Connexion DB + start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📚 Docs available at http://localhost:${port}/docs`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

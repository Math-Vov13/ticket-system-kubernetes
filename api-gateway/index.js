const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const JWT_SECRET = 'your-secret-key'; // Use env in production

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  };

  res.json(healthStatus);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', authenticate, require('./routes/tickets'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
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
    checks: {}
  };

  try {
    // Check auth service
    const authResponse = await axios.get(`${process.env.AUTH_SERVICE_URL || 'http://auth-service:8081'}/health`, { timeout: 5000 });
    healthStatus.checks.auth_service = 'healthy';
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.checks.auth_service = `unhealthy: ${error.message}`;
  }

  try {
    // Check ticket service
    const ticketResponse = await axios.get(`${process.env.TICKET_SERVICE_URL || 'http://ticket-service:8082'}/health`, { timeout: 5000 });
    healthStatus.checks.ticket_service = 'healthy';
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.checks.ticket_service = `unhealthy: ${error.message}`;
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', authenticate, require('./routes/tickets'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
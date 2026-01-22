const express = require('express');
const axios = require('axios');
const router = express.Router();

const TICKET_SERVICE_URL = process.env.TICKET_SERVICE_URL || 'http://localhost:8082';

router.post('/', async (req, res) => {
  try {
    req.body.user_id = req.userId; // From auth middleware
    const response = await axios.post(`${TICKET_SERVICE_URL}/tickets`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${TICKET_SERVICE_URL}/tickets/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(`${TICKET_SERVICE_URL}/tickets/${req.params.id}`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal error' });
  }
});

module.exports = router;
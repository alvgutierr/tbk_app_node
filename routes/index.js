// routes/index.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const BASE_URL = 'https://gw.api.qa2.tbk.cl/transbank/clientes/api/v1/posi';
const CLIENT_ID = '003f624fe6c7c7492eaa55970d860de5';

router.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Proxy: Publicar pago
router.post('/api/pago', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/pago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': CLIENT_ID
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy: Consultar estado
router.get('/api/estado/:commerceCode/:traceId', async (req, res) => {
  try {
    const { commerceCode, traceId } = req.params;
    const response = await fetch(`${BASE_URL}/estado/${commerceCode}/${traceId}`, {
      method: 'GET',
      headers: {
        'X-Client-Id': CLIENT_ID
      }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy: Enviar impresión
router.post('/api/impresion', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/impresion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': CLIENT_ID
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

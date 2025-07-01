// routes/index.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const multer = require('multer');
const upload = multer();

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

// Proxy: Cancelar pago
router.patch('/api/cancelar/:commerceCode/:traceId', async (req, res) => {
  try {
    const { commerceCode, traceId } = req.params;
    const response = await fetch(`${BASE_URL}/cancelar/${commerceCode}/${traceId}`, {
      method: 'PATCH',
      headers: {
        'X-Client-Id': CLIENT_ID
      }
    });

    if (response.status === 204) {
      res.status(204).send(); // Sin contenido
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Proxy: Enviar impresión
router.post('/api/impresion', upload.single('message'), async (req, res) => {
  try {
    const { type, commerceCode, terminalId, transactionHostId } = req.body;

    if (!type || !req.body || (!req.body.message && !req.file)) {
      return res.status(400).json({ error: 'Se requiere "type" y "message"' });
    }

    let encodedMessage = '';

    if (type === 'text') {
      if (typeof req.body.message !== 'string') {
        return res.status(400).json({ error: 'message debe ser texto si type es "text"' });
      }
      encodedMessage = Buffer.from(req.body.message, 'utf-8').toString('base64');
    } else if (type === 'image') {
      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió archivo en "message"' });
      }
      encodedMessage = req.file.buffer.toString('base64');
    } else {
      return res.status(400).json({ error: 'type debe ser "text" o "image"' });
    }

    const payload = {
      commerceCode,
      terminalId,
      transactionHostId,
      message: encodedMessage
    };

    console.log('[TBK REQUEST] =>', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/impresion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': CLIENT_ID
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
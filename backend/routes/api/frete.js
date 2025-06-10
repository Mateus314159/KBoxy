// backend/routes/api/frete.js
const express = require('express');
const router = express.Router();
const calcularFrete = require('../../utils/frete');

// POST /api/frete
router.post('/frete', async (req, res) => {
  try {
    const valorFrete = await calcularFrete(req.body.cep);
    return res.json({ frete: valorFrete });
  } catch (err) {
    console.error('[API Frete] ', err);
    // envia err.message para o front
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

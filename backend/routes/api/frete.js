// backend/routes/api/frete.js
const express = require('express');
const router = express.Router();
const calcularFrete = require('../../utils/frete');

// POST /api/frete
router.post('/frete', async (req, res) => {
  try {
    const { cep } = req.body;
    const valorFrete = await calcularFrete(cep);
    res.json({ frete: valorFrete });
  } catch (err) {
    console.error('Erro ao calcular frete:', err);
    res.status(500).json({ error: 'Não foi possível calcular o frete.' });
  }
});

module.exports = router;

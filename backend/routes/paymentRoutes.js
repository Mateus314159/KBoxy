// K-boxy/backend/routes/paymentRoutes.js

const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const router = express.Router();

// POST /api/payment/create_preference
router.post('/create_preference', async (req, res) => {
  const { planId, price, title, description } = req.body;

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error('❌ MERCADOPAGO_ACCESS_TOKEN não definido em process.env');
    return res.status(500).json({ message: 'Token do Mercado Pago ausente.' });
  }

  try {
    const preference = {
      items: [
        {
          id: planId,
          title: title,
          description: description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(price)
        }
      ],
      back_urls: {
        success: 'http://localhost:5000/payment/success',
        failure: 'http://localhost:5000/payment/failure',
        pending: 'http://localhost:5000/payment/pending'
      },
      // Removemos auto_return para que o Sandbox aceite http://localhost URLs
      //auto_return: 'approved',
      external_reference: planId
    };

    // Chamada direta à API REST do Mercado Pago
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preference,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      id: response.data.id,
      checkoutUrl: response.data.init_point
    });
  } catch (err) {
    if (err.response) {
      console.error('❌ Erro na API do MP:', err.response.status, err.response.data);
    } else {
      console.error('❌ Erro desconhecido ao chamar MP:', err.message);
    }
    return res.status(500).json({ message: 'Erro interno ao criar preferência de pagamento.' });
  }
});

// Rotas de callback após pagamento
router.get('/success', (req, res) => {
  return res.sendFile(path.join(__dirname, '..', '..', 'payment-status', 'success.html'));
});
router.get('/failure', (req, res) => {
  return res.sendFile(path.join(__dirname, '..', '..', 'payment-status', 'failure.html'));
});
router.get('/pending', (req, res) => {
  return res.sendFile(path.join(__dirname, '..', '..', 'payment-status', 'pending.html'));
});

module.exports = router;

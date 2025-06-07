// backend/routes/paymentRoutes.js

const express = require('express');
const axios =require('axios');
const path = require('path');
require('dotenv').config();

const router = express.Router();

const Order         = require('../models/Order');
const Subscription  = require('../models/Subscription');

// -----------------------------------------------------------
// Mapeamento de planos
// -----------------------------------------------------------
const PLANOS = {
  firstLove: {
    nome: 'K-BOXY First Love (Compra Única)',
    valor: 69.90,
    duracao: 'Única'
  },
  fl_semi_annual: {
    nome: 'K-BOXY First Love (Assinatura Semestral)',
    valor: 54.90,
    duracao: '6 meses'
  },
  fl_annual: {
    nome: 'K-BOXY First Love (Assinatura Anual)',
    valor: 49.90,
    duracao: '12 meses'
  },
  idolBox: {
    nome: 'K-BOXY Lover (Compra Única)',
    valor: 79.90,
    duracao: 'Única'
  },
  il_semi_annual: {
    nome: 'K-BOXY Lover (Assinatura Semestral)',
    valor: 64.90,
    duracao: '6 meses'
  },
  il_annual: {
    nome: 'K-BOXY Lover (Assinatura Anual)',
    valor: 59.90,
    duracao: '12 meses'
  },
  legendBox: {
    nome: 'K-BOXY True Love (Compra Única)',
    valor: 99.90,
    duracao: 'Única'
  },
  tl_semi_annual: {
    nome: 'K-BOXY True Love (Assinatura Semestral)',
    valor: 84.90,
    duracao: '6 meses'
  },
  tl_annual: {
    nome: 'K-BOXY True Love (Assinatura Anual)',
    valor: 79.90,
    duracao: '12 meses'
  },
};

// -----------------------------------------------------------
// Rota: criar preferência de pagamento no Mercado Pago
// -----------------------------------------------------------
router.post('/create_preference', async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !PLANOS[planId]) {
      console.error('Plano inválido recebido:', planId);
      return res.status(400).json({ error: 'Plano inválido.' });
    }

    const planoSelecionado = PLANOS[planId];
    const { nome, valor, duracao: duracaoPlano } = planoSelecionado;

    const itens = [
      {
        title: nome,
        unit_price: parseFloat(valor.toFixed(2)),
        quantity: 1,
        currency_id: 'BRL',
      },
    ];

    const serverUrl = process.env.SERVER_URL || 'https://kboxy-teste-site.onrender.com';

    const urlSucesso  = `${serverUrl}/api/payment/success`;
    const urlFalha    = `${serverUrl}/api/payment/failure`;
    const urlPendente = `${serverUrl}/api/payment/pending`;

    const preferencePayload = {
      items: itens,
      back_urls: {
        success: urlSucesso,
        failure: urlFalha,
        pending: urlPendente,
      },
      auto_return: 'approved',
    };

    if (duracaoPlano !== 'Única') {
      let repetitions;
      const frequency = 1;
      const frequency_type = 'months';

      if (duracaoPlano === '6 meses') {
        repetitions = 6;
      } else if (duracaoPlano === '12 meses') {
        repetitions = 12;
      }

      if (repetitions) {
        preferencePayload.auto_recurring = {
          frequency: frequency,
          frequency_type: frequency_type,
          transaction_amount: parseFloat(valor.toFixed(2)),
          currency_id: 'BRL',
          repetitions: repetitions
        };
      } else {
        console.error(`Duração do plano não mapeada para recorrência: ${duracaoPlano}`);
        return res.status(400).json({ error: 'Configuração de duração do plano inválida para assinatura.' });
      }
    }

    console.log('Enviando para Mercado Pago /checkout/preferences:', JSON.stringify(preferencePayload, null, 2));

    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferencePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Resposta do Mercado Pago:', response.data);
    return res.json({ checkoutUrl: response.data.init_point, preferenceId: response.data.id });

  } catch (err) {
    if (err.response) {
      console.error('Erro ao criar preferência Mercado Pago (resposta da API):', JSON.stringify(err.response.data, null, 2));
      console.error('Status da resposta do Mercado Pago:', err.response.status);
      console.error('Headers da resposta do Mercado Pago:', err.response.headers);
    } else if (err.request) {
      console.error('Erro ao criar preferência Mercado Pago (sem resposta da API):', err.request);
    } else {
      console.error('Erro ao criar preferência Mercado Pago (erro na configuração da requisição):', err.message);
    }
    return res.status(500).json({ error: 'Erro interno ao criar preferência de pagamento.' });
  }
});

// -----------------------------------------------------------
// CALLBACKS
// -----------------------------------------------------------
// -----------------------------------------------------------
// Callback de Sucesso do Mercado Pago
// -----------------------------------------------------------
router.get('/success', async (req, res) => {
  console.log('Callback Success - Query:', req.query);
  try {
    const prefId = req.query.preference_id || req.query.preferenceId;
    const order = await Order.findOne({ paymentId: prefId });

    if (order && order.isSubscription) {
      const hoje = new Date();
      const duracao = parseInt(order.planType, 10);
      const dataProxima = new Date(hoje);
      dataProxima.setMonth(dataProxima.getMonth() + duracao);
      const repsLeft = duracao > 1 ? (duracao - 1) : 0;

      let subs = await Subscription.findOne({ userId: order.userId, status: 'active' });
      if (!subs) {
        subs = new Subscription({
          userId:          order.userId,
          boxType:         order.boxType,
          planType:        order.planType === '1'   ? 'one_time'
                           : order.planType === '6'   ? 'semiannual'
                           : order.planType === '12'  ? 'annual'
                           : order.planType,
          startDate:       hoje,
          nextPaymentDate: dataProxima,
          repetitionsLeft: repsLeft,
          status:          'active'
        });
      } else {
        subs.boxType         = order.boxType;
        subs.planType        = order.planType === '1'   ? 'one_time'
                               : order.planType === '6'   ? 'semiannual'
                               : order.planType === '12'  ? 'annual'
                               : order.planType;
        subs.startDate       = hoje;
        subs.nextPaymentDate = dataProxima;
        subs.repetitionsLeft = repsLeft;
        subs.status          = 'active';
      }
      await subs.save();
    }

    return res.sendFile(
      path.join(__dirname, '..', '..', 'payment', 'success.html')
    );
  } catch (err) {
    console.error('Erro no callback de sucesso:', err);
    return res.status(500).send('Erro interno');
  }
});

router.get('/failure', (req, res) => {
  console.log('Callback Failure - Query:', req.query);
  return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'failure.html'));
});

router.get('/pending', (req, res) => {
  console.log('Callback Pending - Query:', req.query);
  return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'pending.html'));
});

module.exports = router;
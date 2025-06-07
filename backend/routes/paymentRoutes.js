// backend/routes/paymentRoutes.js

const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const router = express.Router();

const Order         = require('../models/Order');
const Subscription  = require('../models/Subscription');

// Função auxiliar para criar uma pausa (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mapeamento de planos (sem alterações)
const PLANOS = {
  firstLove: { nome: 'K-BOXY First Love (Compra Única)', valor: 69.90, duracao: 'Única' },
  fl_semi_annual: { nome: 'K-BOXY First Love (Assinatura Semestral)', valor: 54.90, duracao: '6 meses' },
  fl_annual: { nome: 'K-BOXY First Love (Assinatura Anual)', valor: 49.90, duracao: '12 meses' },
  idolBox: { nome: 'K-BOXY Lover (Compra Única)', valor: 79.90, duracao: 'Única' },
  il_semi_annual: { nome: 'K-BOXY Lover (Assinatura Semestral)', valor: 64.90, duracao: '6 meses' },
  il_annual: { nome: 'K-BOXY Lover (Assinatura Anual)', valor: 59.90, duracao: '12 meses' },
  legendBox: { nome: 'K-BOXY True Love (Compra Única)', valor: 99.90, duracao: 'Única' },
  tl_semi_annual: { nome: 'K-BOXY True Love (Assinatura Semestral)', valor: 84.90, duracao: '6 meses' },
  tl_annual: { nome: 'K-BOXY True Love (Assinatura Anual)', valor: 79.90, duracao: '12 meses' },
};


// Rota para criar preferência de pagamento (sem alterações)
router.post('/create_preference', async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId || !PLANOS[planId]) return res.status(400).json({ error: 'Plano inválido.' });
    const planoSelecionado = PLANOS[planId];
    const { nome, valor, duracao: duracaoPlano } = planoSelecionado;
    const itens = [{ title: nome, unit_price: parseFloat(valor.toFixed(2)), quantity: 1, currency_id: 'BRL' }];
    const serverUrl = process.env.SERVER_URL || 'https://kboxy-teste-site.onrender.com';
    const preferencePayload = {
      items: itens,
      back_urls: {
        success: `${serverUrl}/api/payment/success`,
        failure: `${serverUrl}/api/payment/failure`,
        pending: `${serverUrl}/api/payment/pending}`,
      },
      auto_return: 'approved',
    };
    if (duracaoPlano !== 'Única') {
      let repetitions;
      if (duracaoPlano === '6 meses') repetitions = 6;
      else if (duracaoPlano === '12 meses') repetitions = 12;
      if (repetitions) {
        preferencePayload.auto_recurring = {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: parseFloat(valor.toFixed(2)),
          currency_id: 'BRL',
          repetitions: repetitions
        };
      }
    }
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preferencePayload, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return res.json({ checkoutUrl: response.data.init_point, preferenceId: response.data.id });
  } catch (err) {
    console.error('Erro ao criar preferência Mercado Pago:', err.response ? err.response.data : err.message);
    return res.status(500).json({ error: 'Erro interno ao criar preferência de pagamento.' });
  }
});


// ===================================================================
// INÍCIO DA SEÇÃO FINAL E CORRIGIDA
// ===================================================================
router.get('/success', async (req, res) => {
  console.log('[SUCCESS] Callback /success acionado. Query:', req.query);
  try {
    const prefId = req.query.preference_id;
    if (!prefId) {
      console.error('[SUCCESS-ERROR] Nenhuma preference_id encontrada na query.');
      return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'success.html'));
    }

    console.log(`[SUCCESS] Buscando pedido com paymentId (preference_id): ${prefId}`);
    let order = await Order.findOne({ paymentId: prefId });

    // *** LÓGICA DE NOVA TENTATIVA ***
    // Se o pedido não for encontrado na primeira tentativa, espere 2 segundos e tente de novo.
    if (!order) {
      console.warn(`[SUCCESS-WARN] Pedido com paymentId ${prefId} não encontrado. Tentando novamente em 2 segundos...`);
      await delay(2000); // Pausa de 2 segundos
      order = await Order.findOne({ paymentId: prefId });
    }

    // Agora, verificamos novamente. Se ainda for nulo, registramos um erro final.
    if (!order) {
      console.error(`[SUCCESS-ERROR-FINAL] Pedido com paymentId ${prefId} NÃO FOI ENCONTRADO mesmo após a espera. A assinatura não pode ser criada.`);
      return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'success.html'));
    }

    console.log(`[SUCCESS] Pedido encontrado para o usuário: ${order.userId}. Verificando se é uma assinatura...`);

    if (order.isSubscription) {
      console.log('[SUCCESS] O pedido é uma assinatura. Processando...');
      const hoje = new Date();
      const duracao = parseInt(order.planType, 10);
      const dataProxima = new Date(hoje);
      dataProxima.setMonth(dataProxima.getMonth() + 1);
      const repsLeft = duracao > 1 ? (duracao - 1) : 0;
      const planTypeString = order.planType === '1' ? 'one_time' : order.planType === '6' ? 'semiannual' : order.planType === '12' ? 'annual' : 'unknown';

      let subs = await Subscription.findOne({ userId: order.userId });

      if (!subs) {
        console.log(`[SUCCESS] Criando nova assinatura para o usuário ${order.userId}...`);
        subs = new Subscription({ userId: order.userId, boxType: order.boxType, planType: planTypeString, startDate: hoje, nextPaymentDate: dataProxima, repetitionsLeft: repsLeft, status: 'active' });
      } else {
        console.log(`[SUCCESS] Atualizando assinatura existente para o usuário ${order.userId}...`);
        subs.boxType = order.boxType;
        subs.planType = planTypeString;
        subs.startDate = hoje;
        subs.nextPaymentDate = dataProxima;
        subs.repetitionsLeft = repsLeft;
        subs.status = 'active';
      }
      
      await subs.save();
      console.log(`[SUCCESS] Assinatura para o usuário ${order.userId} salva com sucesso!`);
    } else {
      console.log('[SUCCESS] O pedido é uma compra única. Nenhuma ação de assinatura necessária.');
    }

    return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'success.html'));
  } catch (err) {
    console.error('[SUCCESS-CRITICAL] Erro inesperado no callback de sucesso:', err);
    return res.status(500).send('Erro interno ao processar seu pagamento.');
  }
});
// ===================================================================
// FIM DA SEÇÃO FINAL E CORRIGIDA
// ===================================================================

router.get('/failure', (req, res) => {
  console.log('Callback Failure - Query:', req.query);
  return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'failure.html'));
});

router.get('/pending', (req, res) => {
  console.log('Callback Pending - Query:', req.query);
  return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'pending.html'));
});

module.exports = router;
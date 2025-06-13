// backend/routes/paymentRoutes.js

const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
const auth = require('../middleware/authMiddleware');
const router = express.Router();

const Order         = require('../models/Order');
const Subscription  = require('../models/Subscription');
const User          = require('../models/User'); // <<< ADICIONE
const mailer        = require('../utils/mailer'); // <<< ADICIONE

// Função auxiliar para criar uma pausa (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mapeamento de planos
const PLANOS = {
  firstLove:       { nome: 'K-BOXY First Love (Compra Única)',        valor: 69.90, duracao: 'Única' },
  fl_semi_annual:  { nome: 'K-BOXY First Love (Assinatura Semestral)', valor: 54.90, duracao: '6 meses' },
  fl_annual:       { nome: 'K-BOXY First Love (Assinatura Anual)',     valor: 49.90, duracao: '12 meses' },
  idolBox:         { nome: 'K-BOXY Lover (Compra Única)',              valor: 79.90, duracao: 'Única' },
  il_semi_annual:  { nome: 'K-BOXY Lover (Assinatura Semestral)',      valor: 64.90, duracao: '6 meses' },
  il_annual:       { nome: 'K-BOXY Lover (Assinatura Anual)',         valor: 59.90, duracao: '12 meses' },
  legendBox:       { nome: 'K-BOXY True Love (Compra Única)',         valor: 99.90, duracao: 'Única' },
  tl_semi_annual:  { nome: 'K-BOXY True Love (Assinatura Semestral)', valor: 84.90, duracao: '6 meses' },
  tl_annual:       { nome: 'K-BOXY True Love (Assinatura Anual)',     valor: 79.90, duracao: '12 meses' },
  miniKBoxyPromo:  { nome: 'Mini K-BOXY – Compra Única',             valor: 30.00, duracao: 'Única' }
};

/// Rota para criar preferência E SALVAR o pedido
router.post('/create_preference', auth, async (req, res) => {
  try {
    // Desestruturação incluindo totalPrice
    const { planId, boxType, price, totalPrice, duration, title } = req.body;
    const userId = req.userId;

    if (!planId || !PLANOS[planId]) {
      return res.status(400).json({ error: 'Plano inválido.' });
    }

    // Usa totalPrice se fornecido, senão cai no price original
    const priceToUse = (totalPrice !== undefined && !isNaN(parseFloat(totalPrice)))
      ? parseFloat(totalPrice)
      : price;

    const isSubscription = duration > 1;

    // 1. Cria a preferência no Mercado Pago
    const unitPrice = parseFloat(priceToUse.toFixed(2));
    const itens = [{
      title: title,
      unit_price: unitPrice,
      quantity: 1,
      currency_id: 'BRL'
    }];
    const serverUrl = process.env.SERVER_URL || 'https://kboxy.onrender.com';

    const preferencePayload = {
      items: itens,
     back_urls: {
  success: `${serverUrl}/api/payment/success`,
  failure: `${serverUrl}/payment/failure.html`,
  pending: `${serverUrl}/payment/pending.html`,
},
      auto_return: 'approved',
      external_reference: userId
    };

    if (isSubscription) {
      preferencePayload.auto_recurring = {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: unitPrice,
        currency_id: 'BRL',
        repetitions: duration
      };
    }

    const mpResponse = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferencePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const preferenceId = mpResponse.data.id;
    const checkoutUrl   = mpResponse.data.init_point;

    console.log(`[Create_Preference] Preferência MP ${preferenceId} criada para o usuário ${userId}.`);

    // 2. SALVA O PEDIDO NO BANCO DE DADOS ANTES DE REDIRECIONAR
    const orderData = {
      userId:        userId,
      boxType:       boxType || planId,
      planType:      planId,
      amount:        unitPrice,
      paymentId:     preferenceId,
      isSubscription: isSubscription,
      duration:      duration,
      status:        'pending'
    };

    const newOrder = new Order(orderData);
    await newOrder.save();
    console.log(`[Create_Preference] Pedido ${newOrder._id} salvo no DB com paymentId ${preferenceId}.`);

    // 3. Retorna a URL de checkout para o frontend
    return res.json({ checkoutUrl: checkoutUrl, preferenceId: preferenceId });

  } catch (err) {
    console.error('Erro ao criar preferência/pedido:', err.response ? err.response.data : err.message);
    return res.status(500).json({ error: 'Erro interno ao criar a ordem de pagamento.' });
  }
});

// ===================================================================
// CALLBACKS DE PAGAMENTO (sem alterações necessárias)
// ===================================================================
router.get('/success', async (req, res) => {
  console.log('[SUCCESS] Callback /success acionado. Query:', req.query);
  try {
    const prefId = req.query.preference_id;
    if (!prefId) {
      console.error('[SUCCESS-ERROR] Nenhuma preference_id encontrada na query.');
      return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'success.html'));
    }

    console.log(`[SUCCESS] Buscando pedido com paymentId: ${prefId}`);
    let order = await Order.findOne({ paymentId: prefId });

    if (!order) {
      console.warn(`[SUCCESS-WARN] Pedido não encontrado. Tentando novamente em 2s...`);
      await delay(2000);
      order = await Order.findOne({ paymentId: prefId });
    }

    if (!order) {
      console.error(`[SUCCESS-ERROR-FINAL] Pedido não encontrado. Assinatura não criada.`);
      return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'success.html'));
    }

    if (order.isSubscription) {
      const hoje = new Date();
      const dataProxima = new Date(hoje);
      dataProxima.setMonth(dataProxima.getMonth() + 1);
      const duracao = order.duration;
      const repsLeft = duracao > 1 ? (duracao - 1) : 0;

      let planTypeString = 'Desconhecido';
      if (order.planType.includes('annual')) {
        planTypeString = 'Anual';
      } else if (order.planType.includes('semi_annual')) {
        planTypeString = 'Semestral';
      }

      let subs = await Subscription.findOne({ userId: order.userId });
      if (!subs) {
        subs = new Subscription({
          userId:         order.userId,
          boxType:        order.boxType,
          planType:       planTypeString,
          startDate:      hoje,
          nextPaymentDate: dataProxima,
          repetitionsLeft: repsLeft,
          status:         'active'
        });
      } else {
        subs.boxType        = order.boxType;
        subs.planType       = planTypeString;
        subs.startDate      = hoje;
        subs.nextPaymentDate = dataProxima;
        subs.repetitionsLeft = repsLeft;
        subs.status         = 'active';
      }
      await subs.save();
      console.log(`[SUCCESS] Assinatura atualizada/criada para o usuário ${order.userId}.`);
    } else {
      console.log('[SUCCESS] Compra única. Sem ação de assinatura.');
    }

    // ===================================================================
// INÍCIO - LÓGICA DE ENVIO DE E-MAIL
// ===================================================================
try {
  // 1. Buscar os dados completos do usuário (incluindo nome, email e endereço)
  const buyer = await User.findById(order.userId);
  if (!buyer) {
    console.error(`[EMAIL-ERROR] Usuário com ID ${order.userId} não encontrado para envio de e-mail.`);
  } else {
    // 2. Preparar os dados para os templates
    const planDetails = PLANOS[order.planType] || { nome: 'Plano Desconhecido' };
    const emailData = {
      planName: planDetails.nome,
      boxType: order.boxType,
      amount: order.amount.toFixed(2),
      duration: order.isSubscription ? `${order.duration} meses` : 'Compra Única',
      customerName: buyer.name,
      customerEmail: buyer.email,
      street: buyer.address.street,
      number: buyer.address.number,
      complement: buyer.address.complement,
      neighborhood: buyer.address.neighborhood,
      city: buyer.address.city,
      state: buyer.address.state,
      zipcode: buyer.address.zipcode,
       currentYear: new Date().getFullYear()
    };

    // 3. Enviar e-mail de confirmação para o administrador
    await mailer.sendTemplatedMail(
      'kboxy.pop@gmail.com',
      `Nova Venda K-BOXY: ${planDetails.nome}`,
      'adminConfirmation',
      emailData
    );
    console.log(`[EMAIL-SUCCESS] E-mail de notificação de venda enviado para o administrador.`);

    // 4. Enviar e-mail de confirmação para o cliente
    await mailer.sendTemplatedMail(
      buyer.email,
      'Seu pedido K-BOXY foi confirmado!',
      'customerConfirmation',
      emailData
    );
    console.log(`[EMAIL-SUCCESS] E-mail de confirmação enviado para o cliente: ${buyer.email}`);
  }
} catch (emailError) {
  console.error('[EMAIL-CRITICAL] Falha crítica ao tentar enviar os e-mails de confirmação:', emailError);
  // A falha no envio de e-mail não deve impedir a confirmação do pagamento para o usuário.
}
// ===================================================================
// FIM - LÓGICA DE ENVIO DE E-MAIL
// ===================================================================

return res.sendFile(path.join(__dirname, '..', '..', 'payment', 'success.html'));
    
  } catch (err) {
    console.error('[SUCCESS-CRITICAL] Erro no callback de sucesso:', err);
    return res.status(500).send('Erro interno ao processar seu pagamento.');
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

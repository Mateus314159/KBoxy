// backend/controllers/orderController.js

const axios = require('axios');
const Order = require('../models/Order');

console.log('--- O ARQUIVO orderController.js FOI CARREGADO PELO SERVIDOR ---');

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


exports.createOrder = async (req, res) => {
  // DETETIVE 1: A rota foi chamada?
  console.log('[CreateOrder] A função createOrder foi iniciada.');
  
  try {
    const { boxType, planType: planId } = req.body;
    console.log(`[CreateOrder] Recebido: boxType='${boxType}', planId='${planId}'`);

    if (!planId || !PLANOS[planId]) {
      console.error(`[CreateOrder-ERROR] Plano inválido ou não encontrado: '${planId}'`);
      return res.status(400).json({ error: 'Plano inválido.' });
    }

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

    let duration = 1;
    if (duracaoPlano !== 'Única') {
      duration = duracaoPlano === '6 meses' ? 6 : (duracaoPlano === '12 meses' ? 12 : 1);
      preferencePayload.auto_recurring = {
        frequency: 1, frequency_type: 'months', transaction_amount: parseFloat(valor.toFixed(2)), currency_id: 'BRL', repetitions: duration
      };
    }
    
    // DETETIVE 2: Enviando para o Mercado Pago
    console.log('[CreateOrder] Enviando dados para criar preferência no Mercado Pago...');
    const mpResponse = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferencePayload,
      { headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` } }
    );

    const preferenceId = mpResponse.data.id;
    const initPoint = mpResponse.data.init_point;
    console.log(`[CreateOrder] Preferência recebida do MP. Preference ID: ${preferenceId}`);

    const isSubscription = duration > 1;

    // DETETIVE 3: Tentando salvar o Pedido no DB.
    console.log('[CreateOrder] Preparando para salvar o Pedido no banco de dados...');
    const orderData = {
      userId: req.userId, boxType: boxType, planType: duration.toString(), amount: valor,
      paymentId: preferenceId, isSubscription: isSubscription, duration: duration, status: 'pending'
    };
    console.log('[CreateOrder] Dados do pedido a serem salvos:', JSON.stringify(orderData, null, 2));
    
    const newOrder = await Order.create(orderData);
    
    // DETETIVE 4: Confirmação de que o Pedido foi salvo.
    console.log(`[CreateOrder] Pedido salvo com sucesso no DB! ID do Pedido: ${newOrder._id}`);
    
    return res.status(200).json({
      init_point: initPoint,
      preference_id: preferenceId
    });

  } catch (error) {
    // DETETIVE 5: Bloco de erro aprimorado para nos dar a causa exata.
    console.error('[CreateOrder-CRITICAL] Um erro ocorreu no bloco try/catch da função createOrder.');
    if (error.response) {
      // Este bloco captura erros da API do Mercado Pago (ex: token inválido)
      console.error('[CreateOrder-ERROR] Detalhes do erro da API externa (Mercado Pago):', JSON.stringify(error.response.data, null, 2));
    } else if (error.name === 'ValidationError') {
      // Este bloco captura erros de validação do Mongoose (ex: campo obrigatório faltando no Model 'Order')
      console.error('[CreateOrder-ERROR] Detalhes do erro de validação do Mongoose:', error.message);
    } else {
      // Captura todos os outros erros
      console.error('[CreateOrder-ERROR] Detalhes do erro geral:', error.message, error.stack);
    }
    return res.status(500).json({ error: 'Não foi possível criar a ordem de pagamento.' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    return res.json(orders);
  } catch (err) {
    console.error('Erro em getUserOrders:', err);
    return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
};
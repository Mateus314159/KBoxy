// backend/controllers/orderController.js

const axios = require('axios');
const Order = require('../models/Order');

// -----------------------------------------------------------
// Definição dos planos e valores correspondentes
// Deve bater exatamente com o que você usou em paymentRoutes.js
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
  }
};

exports.createOrder = async (req, res) => {
  try {
    // 1) Ler do corpo da requisição: qual boxType e qual planId (identificador do plano).
    //    Exemplo de planId: 'il_semi_annual', 'fl_annual', 'firstLove' etc.
    const { boxType, planType: planId } = req.body;

    // 2) Validar que esse planId existe nos nossos PLANOS
    if (!planId || !PLANOS[planId]) {
      return res.status(400).json({ error: 'Plano inválido.' });
    }

    // 3) Extrair dados do plano selecionado (nome para checkout, valor, duração)
    const planoSelecionado = PLANOS[planId];
    const { nome, valor, duracao: duracaoPlano } = planoSelecionado;

    // 4) Construir o objeto de itens para enviar ao Mercado Pago
    const itens = [
      {
        title: nome,
        unit_price: parseFloat(valor.toFixed(2)),
        quantity: 1,
        currency_id: 'BRL'
      }
    ];

    // 5) Construir as URLs de retorno (back_urls) que o Mercado Pago usará.
    //    Estas variáveis de ambiente devem existir em .env:
    //    - BACK_URL_SUCCESS  = 'https://seusite.com/api/payment/success'
    //    - BACK_URL_FAILURE  = 'https://seusite.com/api/payment/failure'
    //    - BACK_URL_PENDING  = 'https://seusite.com/api/payment/pending'
    const urlSucesso  = process.env.BACK_URL_SUCCESS;
    const urlFalha    = process.env.BACK_URL_FAILURE;
    const urlPendente = process.env.BACK_URL_PENDING;

    // 6) Montar o payload base para criar a preferência
    const preferencePayload = {
      items: itens,
      back_urls: {
        success: urlSucesso,
        failure: urlFalha,
        pending: urlPendente
      },
      auto_return: 'approved'
    };

    // 7) Se o plano for de assinatura (ou seja, duracaoPlano !== 'Única'),
    //    precisamos adicionar o objeto auto_recurring
    let duration = 1; // número de parcelas: 1 por padrão (compra única)
    if (duracaoPlano !== 'Única') {
      // Converter "6 meses" → 6, ou "12 meses" → 12
      duration = duracaoPlano === '6 meses' ? 6 : (duracaoPlano === '12 meses' ? 12 : 1);

      // Adiciona o campo auto_recurring conforme a documentação do Mercado Pago
      preferencePayload.auto_recurring = {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: parseFloat(valor.toFixed(2)),
        currency_id: 'BRL',
        repetitions: duration
      };
    }

    // 8) Enviar requisição ao Mercado Pago para criar a preferência
    //    Use a sua variável de ambiente MERCADOPAGO_ACCESS_TOKEN
    const mpResponse = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferencePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      }
    );

    // 9) Ler da resposta o preference_id (id da preferência) e o init_point (URL de checkout)
    const preferenceId = mpResponse.data.id;
    const initPoint    = mpResponse.data.init_point;

    // 10) Determinar se é assinatura recorrente: duration > 1
    const isSubscription = duration > 1;

    // 11) **Gravar o Order no banco antes de redirecionar** (para que o callback do sucesso o encontre)
    const newOrder = await Order.create({
      userId:         req.userId,          // injetado pelo authMiddleware
      boxType:        boxType,             // ex.: 'il_semi_annual'
      planType:       duration.toString(), // ex.: '6', '12' ou '1'
      amount:         valor,               // valor unitário (R$ 64,90 ou R$ 54,90 etc.)
      paymentId:      preferenceId,        // o preference_id do Mercado Pago
      isSubscription: isSubscription,      // true para 6 ou 12 meses
      duration:       duration,            // número total de parcelas (6, 12 ou 1)
      status:         'pending'            // status inicial (ainda não pago)
    });

    // 12) Responder ao front-end com a URL de checkout (init_point) e o preference_id
    return res.status(200).json({
      init_point:    initPoint,
      preference_id: preferenceId
    });
  } catch (error) {
    console.error('Erro em createOrder:', error);
    return res.status(500).json({ error: 'Não foi possível criar a ordem.' });
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

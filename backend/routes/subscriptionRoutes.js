// backend/routes/subscriptionRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // ajusta o caminho para seu authMiddleware
const Subscription = require('../models/Subscription');

// GET /api/subscription → retorna assinatura ativa do usuário logado
router.get('/', auth, async (req, res) => {
  try {
    const subs = await Subscription.findOne({ userId: req.userId, status: 'active' });
    if (!subs) {
      return res.status(200).json({ planType: null });
    }
    return res.status(200).json({
      planType: subs.planType,
      boxType: subs.boxType,
      startDate: subs.startDate,
      nextPaymentDate: subs.nextPaymentDate,
      repetitionsLeft: subs.repetitionsLeft
    });
  } catch (err) {
    console.error('Erro ao buscar assinatura:', err);
    return res.status(500).json({ message: 'Erro interno ao buscar assinatura.' });
  }
});

// DELETE /api/subscription → cancela a assinatura ativa
router.delete('/', auth, async (req, res) => {
  try {
    const subs = await Subscription.findOne({ userId: req.userId, status: 'active' });
    if (!subs) {
      return res.status(404).json({ message: 'Nenhuma assinatura ativa encontrada.' });
    }
    subs.status = 'cancelled';
    await subs.save();
    return res.status(200).json({ message: 'Assinatura cancelada com sucesso.' });
  } catch (err) {
    console.error('Erro ao cancelar assinatura:', err);
    return res.status(500).json({ message: 'Erro interno ao cancelar assinatura.' });
  }
});

module.exports = router;

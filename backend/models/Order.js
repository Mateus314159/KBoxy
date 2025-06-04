// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boxType: {
    type: String,
    required: true
    // "First Love", "Lover", ou "True Love"
  },
  planType: {
    type: String,
    required: true
    // "one_time", "semiannual", "annual"
  },
  amount: {
    type: Number,
    required: true
    // valor cobrado por mês (ou valor único, se planType === "one_time")
  },
  paymentId: {
    type: String,
    required: true
    // preference_id (para compra única) ou preapproval_id (para assinaturas)
  },
  isSubscription: {
    type: Boolean,
    default: false
    // true se duration > 1
  },
  duration: {
    type: Number,
    required: true
    // 1 para compra única; 6 para plano semestral; 12 para plano anual
  },
  status: {
    type: String,
    default: 'pending'
    // possíveis valores: 'pending', 'authorized', 'active', 'cancelled', 'failed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);

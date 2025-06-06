// backend/models/Subscription.js

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boxType: {
    type: String,
    required: true
    // valores esperados: "firstLove", "idolBox" ou "legendBox"
  },
  planType: {
    type: String,
    required: true
    // valores esperados: "one_time", "mensal", "semiannual" ou "annual"
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextPaymentDate: {
    type: Date,
    required: true
  },
  repetitionsLeft: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

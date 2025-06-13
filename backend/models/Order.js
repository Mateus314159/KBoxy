// backend/models/Order.js
const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  number: { type: String, default: '' },
  complement: { type: String, default: '' },
  neighborhood: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipcode: { type: String, default: '' }
}, { _id: false });

const buyerInfoSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boxType: { type: String, required: true },
  planType: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true, index: true },
  isSubscription: { type: Boolean, default: false },
  duration: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },

  items: [{
    title: String,
    unit_price: Number,
    quantity: Number
  }],
  buyerInfo: buyerInfoSchema,
  shippingAddress: shippingAddressSchema

});

module.exports = mongoose.model('Order', orderSchema);
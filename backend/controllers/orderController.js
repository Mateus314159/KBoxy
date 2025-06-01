const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { boxType, planType } = req.body;
    const newOrder = await Order.create({
      userId: req.userId,
      boxType,
      planType
    });
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

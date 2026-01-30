const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  razorpayId: { type: String, required: true, unique: true, index: true },
  receipt: String,
  amount: Number,
  currency: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  selectedNumber: String,
  status: { type: String, default: 'created' },
  paymentId: String,
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
});

module.exports = mongoose.model('Order', OrderSchema);

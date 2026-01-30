const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  number: String,
  purchasedAt: Date,
  orderId: String,
});

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  cards: { type: [CardSchema], default: [] },
  mobile: { type: String, default: '' },
  address: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);

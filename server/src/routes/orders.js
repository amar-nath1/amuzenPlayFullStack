const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// create order: client sends amount (paise) and selectedNumber
router.post('/order', auth, async (req, res) => {
  const { amount, selectedNumber } = req.body;
  if (!amount || !selectedNumber) return res.status(400).json({ error: 'missing_fields' });

  const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const options = { amount, currency: 'INR', receipt, payment_capture: 1 };
  try {
    const order = await razorpay.orders.create(options);
    const ord = new Order({ razorpayId: order.id, receipt, amount: order.amount, currency: order.currency, userId: req.user._id, selectedNumber, status: 'created' });
    await ord.save();
    res.json({ id: order.id, amount: order.amount, currency: order.currency, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    console.error('order create error', e);
    res.status(500).json({ error: 'order_creation_failed' });
  }
});

// verify payment after client-handled checkout
router.post('/verify', auth, async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) return res.status(400).json({ error: 'missing_fields' });

  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const expected = hmac.digest('hex');

  if (expected === razorpay_signature) {
    const ord = await Order.findOne({ razorpayId: razorpay_order_id }).exec();
    if (ord) {
      ord.status = 'paid';
      ord.paymentId = razorpay_payment_id;
      ord.paidAt = Date.now();
      await ord.save();
      const user = await User.findById(ord.userId).exec();
      if (user) {
        user.cards = user.cards || [];
        user.cards.push({ number: ord.selectedNumber, purchasedAt: Date.now(), orderId: ord.razorpayId });
        await user.save();
      }
      return res.json({ ok: true });
    }
    return res.status(404).json({ error: 'order_not_found' });
  } else {
    return res.status(400).json({ ok: false, error: 'invalid_signature' });
  }
});

// webhook endpoint
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const signature = req.headers['x-razorpay-signature'];
  const body = req.body; // raw
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (expected === signature) {
    try {
      const event = JSON.parse(body.toString());
      if (event.event === 'payment.captured' && event.payload && event.payload.payment && event.payload.payment.entity) {
        const payment = event.payload.payment.entity;
        const ord = await Order.findOne({ razorpayId: payment.order_id }).exec();
        if (ord) {
          ord.status = 'paid';
          ord.paymentId = payment.id;
          ord.paidAt = Date.now();
          await ord.save();
          const user = await User.findById(ord.userId).exec();
          if (user) {
            user.cards = user.cards || [];
            if (!user.cards.find((c) => c.orderId === ord.razorpayId)) {
              user.cards.push({ number: ord.selectedNumber, purchasedAt: Date.now(), orderId: ord.razorpayId });
            }
            await user.save();
          }
        }
      }
    } catch (e) {
      console.error('webhook parse error', e);
    }
    return res.status(200).send('ok');
  } else {
    return res.status(400).send('invalid signature');
  }
});

module.exports = router;

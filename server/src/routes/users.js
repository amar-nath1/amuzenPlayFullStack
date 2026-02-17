const express = require('express');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');
const router = require('express').Router();

router.get('/me', auth, (req, res) => {
  const user = req.user;
  const safe = { id: user._id, name: user.name, email: user.email, cards: user.cards };
  res.json(safe);
});

router.get('/cards', auth, async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  let arr = [ { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
  { id: 4, name: "Diana" },
  { id: 5, name: "Ethan" }];
  // res.json({ cards: user.cards || [] });
  res.json({ cards: arr || []});
});

router.post('/update', auth, async (req, res) => {
  const { mobile, address } = req.body;
  try {
    const user = await User.findById(req.user._id).exec();
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    user.mobile = mobile || user.mobile;
    user.address = address || user.address;
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    console.error('update user error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// winners: choose randomly 10% (rounded, minimum 1 if participants exist) of this month's paid orders
router.get('/winners', async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const orders = await Order.find({ status: 'paid', paidAt: { $gte: start, $lt: end } }).exec();
    if (!orders || orders.length === 0) return res.json({ winners: [] });

    // Prepare participant entries
    const participants = orders.map((o) => ({ number: o.selectedNumber, userId: o.userId ? o.userId.toString() : null, orderId: o.razorpayId }));

    const total = participants.length;
    let count = Math.round(total * 0.1);
    if (count < 1 && total > 0) count = 1;

    // shuffle participants (Fisher-Yates)
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }

    const selected = participants.slice(0, count);

    // fetch user names for selected winners (if available)
    const userIds = selected.map((s) => s.userId).filter(Boolean);
    const users = userIds.length ? await User.find({ _id: { $in: userIds } }).exec() : [];
    const userMap = {};
    users.forEach((u) => { userMap[u._id.toString()] = u; });

    const winners = selected.map((s) => ({ number: s.number, userId: s.userId, name: s.userId && userMap[s.userId] ? userMap[s.userId].name || userMap[s.userId].email : null }));

    return res.json({ winners });
  } catch (e) {
    console.error('winners error', e);
    return res.status(500).json({ winners: [] });
  }
});

module.exports = router;


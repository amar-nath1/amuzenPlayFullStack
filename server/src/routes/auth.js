const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

  try {
    const existing = await User.findOne({ email: email.toLowerCase() }).exec();
    if (existing) return res.status(400).json({ error: 'user_exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name: name || '', email: email.toLowerCase(), password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cards: user.cards } });
  } catch (e) {
    console.error('signup error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    if (!user) return res.status(400).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'invalid_credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cards: user.cards } });
  } catch (e) {
    console.error('signin error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;

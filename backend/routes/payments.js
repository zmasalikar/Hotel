const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, bookingId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { bookingId }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Stripe error' });
  }
});

router.patch('/:id/pay', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    booking.paymentStatus = 'paid';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Payment update failed' });
  }
});

module.exports = router;

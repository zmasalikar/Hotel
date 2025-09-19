const express = require('express');
const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? require('stripe')(stripeKey) : null;

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', async (req,res)=>{
  const {amount, currency='usd'} = req.body;
  if(!stripe) return res.status(500).json({error:'Stripe not configured. Set STRIPE_SECRET_KEY in .env'});
  try{
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // in cents if USD; frontend should send cents
      currency
    });
    res.json({clientSecret: paymentIntent.client_secret});
  }catch(err){ res.status(500).json({error: err.message}); }
});

module.exports = router;

// routes/paymentWebhook.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe webhook to listen for payment success
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Update order status to paid
      await Order.findOneAndUpdate(
        { clientSecret: paymentIntent.client_secret },
        { status: 'confirmed', paymentStatus: 'paid' }
      );

      // ✅ Now clear the cart only after successful payment
      const order = await Order.findOne({
        clientSecret: paymentIntent.client_secret,
      });
      if (order) {
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
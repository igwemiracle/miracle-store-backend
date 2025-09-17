const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Stripe requires raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    const orderId = paymentIntent.metadata.orderId;
    const paymentIntentId = paymentIntent.id;

    try {
      // Update Order status
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'succeeded';
        await order.save();
      }

      // Update Payment status
      const payment = await Payment.findOne({ paymentIntentId });
      if (payment) {
        payment.status = 'succeeded';
        await payment.save();
      }

      console.log(`✅ Payment for Order ${orderId} succeeded and records updated.`);
    } catch (err) {
      console.error('❌ Error updating order/payment status:', err.message);
    }
  }

  // Optionally handle other events (e.g., failed, refunded, etc.)
  // else if (event.type === 'payment_intent.payment_failed') { ... }

  res.status(200).json({ received: true });
});

module.exports = router;

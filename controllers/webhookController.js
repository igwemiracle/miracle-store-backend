// controllers/webhookController.js
const stripe = require('../utils/stripe');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { StatusCodes } = require('http-status-codes');

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send('Order not found');

    order.status = 'paid';
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    // Optional: Save to Payment model
    await Payment.create({
      user: order.user,
      order: order._id,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: 'completed',
    });

    console.log(`✅ Order ${orderId} marked as paid`);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findById(orderId);
    if (order) {
      order.status = 'failed';
      await order.save();
    }
    console.log(`❌ Payment failed for order ${orderId}`);
  }

  res.status(StatusCodes.OK).json({ received: true });
};

module.exports = stripeWebhook;

const Payment = require('../models/Payment');
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// ➤ Process payment and save details
const createPayment = async (req, res) => {
  const { orderId, paymentMethodId } = req.body;

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new CustomError.NotFoundError('Order not found');
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // Convert to cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Ensure correct user assignment
  const payment = await Payment.create({
    user: order.user, // Use order's user, not req.user.userId
    order: orderId,
    paymentIntentId: paymentIntent.id,
    amount: order.total,
    status: paymentIntent.status,
  });

  res.status(StatusCodes.CREATED).json({ message: 'Payment successful', payment });
};


// ➤ Get user payment history
const getUserPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.userId }).populate('order');
  res.status(StatusCodes.OK).json({ payments });
};




module.exports = { createPayment, getUserPayments };

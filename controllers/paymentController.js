const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { stripe } = require('../utils/stripe'); // or just `require('../utils/stripe')`

const createPayment = async (req, res) => {
  const { orderId } = req.body;

  // Step 1: Validate Order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new CustomError.NotFoundError(`No order found with ID: ${orderId}`);
  }

  // Step 2: Make sure it’s not already paid
  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment && existingPayment.status === 'succeeded') {
    throw new CustomError.BadRequestError('This order has already been paid for.');
  }

  // Step 3: Confirm payment intent status from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new CustomError.BadRequestError('Payment not completed yet.');
  }

  // Step 4: Save Payment
  const payment = await Payment.create({
    user: req.user.userId,
    order: orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100, // convert cents to dollars
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  });

  res.status(StatusCodes.CREATED).json({ message: 'Payment recorded successfully', payment });
};


// ➤ Get user payment history
const getUserPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.userId }).populate('order');
  res.status(StatusCodes.OK).json({ payments });
};




module.exports = { createPayment, getUserPayments };

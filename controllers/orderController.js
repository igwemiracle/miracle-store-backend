const Order = require('../models/Order');
const Cart = require('../models/Cart');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res) => {
  // Fetch user's cart
  const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new CustomError.BadRequestError('Your cart is empty');
  }

  // Extract cart items and calculate totals
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.image, // Ensure the image is included
    amount: item.product.price * item.quantity, // Ensure the amount is included
  }));

  const subtotal = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = 0.1 * subtotal; // Example tax (10%)
  const shippingFee = 5; // Example shipping fee
  const total = subtotal + tax + shippingFee;

  // Convert total to cents and ensure it's an integer
  const totalInCents = Math.round(total * 100);

  // Create a Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalInCents,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  // Create the order
  const order = await Order.create({
    user: req.user.userId,
    orderItems,
    subtotal,
    tax,
    shippingFee,
    total,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });

  // Clear the cart after order is placed
  await Cart.findOneAndDelete({ user: req.user.userId });

  res.status(StatusCodes.CREATED).json({ order, clientSecret: paymentIntent.client_secret });
};



const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};

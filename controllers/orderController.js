const Order = require('../models/Order');
const Cart = require('../models/Cart');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res) => {
  const { orderItems, tax, shippingFee } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    throw new CustomError.BadRequestError('Please provide valid order items.');
  }

  // Fetch user's cart
  const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new CustomError.BadRequestError('Your cart is empty');
  }

  // Filter selected products from cart
  const selectedItems = cart.items.filter((item) =>
    orderItems.some((order) => order.product === item.product._id.toString())
  );

  if (selectedItems.length === 0) {
    throw new CustomError.BadRequestError('Selected products are not in the cart.');
  }

  // Format order items
  const formattedOrderItems = selectedItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.image,
    amount: item.product.price * item.quantity,
  }));

  // Calculate totals
  const subtotal = selectedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const taxAmount = tax ?? 0.1 * subtotal; // Default 10% tax
  const shippingAmount = shippingFee ?? 5; // Default $5 shipping fee
  const total = subtotal + taxAmount + shippingAmount;
  const totalInCents = Math.round(total * 100);

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalInCents,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  // Create the order
  const order = await Order.create({
    user: req.user.userId,
    orderItems: formattedOrderItems,
    subtotal,
    tax: taxAmount,
    shippingFee: shippingAmount,
    total,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });

  // Remove only ordered items from cart
  cart.items = cart.items.filter(
    (item) => !orderItems.some((order) => order.product === item.product._id.toString())
  );

  await cart.save();

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

const deleteAllOrders = async (req, res) => {
  try {
    // Delete all orders from the database
    await Order.deleteMany({});

    res.status(200).json({ message: 'All orders have been deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete orders', error: error.message });
  }
};


module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  deleteAllOrders
};

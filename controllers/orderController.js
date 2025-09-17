const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const { createPaymentIntent } = require('../utils/stripe');


// 1️⃣ Create PaymentIntent only
const createPaymentIntentOnly = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new CustomError.BadRequestError('Your cart is empty');
  }

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const taxAmount = 0.1 * subtotal;
  const shippingAmount = 5;
  const total = subtotal + taxAmount + shippingAmount;
  const totalInCents = Math.round(total * 100);

  const paymentIntent = await createPaymentIntent(totalInCents);

  res.status(StatusCodes.OK).json({
    clientSecret: paymentIntent.client_secret,
    amount: total,
  });
};

// ---------------------
// Create Order after successful payment
const createOrderAfterPayment = async (req, res) => {
  const { paymentIntentId } = req.body; // from frontend
  if (!paymentIntentId) {
    return res.status(400).json({ msg: "Missing paymentIntentId" });
  }

  // Fetch user's cart
  const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ msg: "Your cart is empty" });
  }

  // Format order items
  const formattedOrderItems = cart.items.map((item) => {
    if (!item.product) {
      throw new Error("Cart item missing product reference");
    }
    return {
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      // ✅ take the first image url like in CartSlider
      image: item.product.images?.[0]?.url || "https://placehold.co/300x300?text=No+Image",
      amount: item.product.price * item.quantity,
    };
  });


  // Calculate totals
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const taxAmount = 0.1 * subtotal;
  const shippingAmount = 5;
  const total = subtotal + taxAmount + shippingAmount;

  try {
    // Create order in DB
    const order = await Order.create({
      user: req.user.userId,
      orderItems: formattedOrderItems,
      subtotal,
      tax: taxAmount,
      shippingFee: shippingAmount,
      total,
      paymentIntentId,
      status: "succeeded", // payment already succeeded
      // clientSecret is optional now, not required
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ order }); // ✅ return in { order } format
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ msg: "Failed to create order", error: err.message });
  }
};


// ====================================================================================================

const createOrder = async (req, res) => {
  const { tax, shippingFee } = req.body; // keep tax + shipping override optional

  // Fetch user's cart
  const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new CustomError.BadRequestError('Your cart is empty');
  }

  // Format order items directly from cart
  const formattedOrderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.image,
    amount: item.product.price * item.quantity,
  }));

  // Calculate totals
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const taxAmount = tax ?? 0.1 * subtotal; // Default 10% tax
  const shippingAmount = shippingFee ?? 5; // Default $5 shipping fee
  const total = subtotal + taxAmount + shippingAmount;
  const totalInCents = Math.round(total * 100);

  // Create Stripe PaymentIntent
  const paymentIntent = await createPaymentIntent(totalInCents);

  console.log("Formatted Order Items:", formattedOrderItems);


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

  // Clear the cart after order is created
  cart.items = [];
  await cart.save();

  res.status(StatusCodes.CREATED).json({
    order,
    clientSecret: paymentIntent.client_secret,
  });
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
  const orders = await Order.find({ user: req.user.userId })
    .populate("orderItems.product"); // ✅ populate products inside orderItems

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
  order.status = 'succeeded';
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
  createPaymentIntentOnly,
  createOrderAfterPayment,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  deleteAllOrders
};

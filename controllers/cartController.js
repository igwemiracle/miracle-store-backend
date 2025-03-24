const Cart = require('../models/Cart');
const Product = require('../models/Product');
const CustomError = require('../errors');

const addToCart = async (req, res) => {
  const { items } = req.body; // Expecting an array of items [{ productId, quantity }, { productId, quantity }]

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new CustomError.BadRequestError('Please provide valid products and quantities');
  }

  let cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    cart = new Cart({ user: req.user.userId, items: [], totalPrice: 0 });
  }

  for (const item of items) {
    const { productId, quantity } = item;

    if (!productId || quantity <= 0) {
      throw new CustomError.BadRequestError('Invalid product or quantity');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new CustomError.NotFoundError(`Product with ID ${productId} not found`);
    }

    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }

  // ✅ Fix: Correctly calculate totalPrice
  const productPrices = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.product);
      return item.quantity * product.price;
    })
  );
  cart.totalPrice = productPrices.reduce((total, price) => total + price, 0);

  await cart.save();
  res.status(200).json({ success: true, cart });
};

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
  if (!cart) {
    throw new CustomError.NotFoundError('Cart is empty');
  }
  res.status(200).json({ success: true, cart });
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

  if (!cart) {
    throw new CustomError.NotFoundError('Cart is empty');
  }

  // Remove the item from the cart
  cart.items = cart.items.filter((item) => item.product._id.toString() !== productId);

  // Recalculate total price
  cart.totalPrice = cart.items.reduce((total, item) => {
    return total + item.quantity * item.product.price;
  }, 0);

  await cart.save();
  res.status(200).json({ success: true, cart });
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart
};
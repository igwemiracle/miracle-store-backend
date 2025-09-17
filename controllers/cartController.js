const Cart = require('../models/Cart');
const Product = require('../models/Product');
const CustomError = require('../errors');

const addToCart = async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }, ...]

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new CustomError.BadRequestError('Please provide valid products and quantities');
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    cart = new Cart({ user: req.user.userId, items: [], totalPrice: 0 });
  }

  for (const item of items) {
    const { productId } = item;
    // default quantity to 1 if undefined or null
    const quantity = item.quantity == null ? 1 : item.quantity;

    if (!productId || quantity <= 0) {
      throw new CustomError.BadRequestError('Invalid product or quantity');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new CustomError.NotFoundError(`Product with ID ${productId} not found`);
    }

    const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId);

    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }
  }

  // Recalculate totalPrice
  const populatedCart = await Cart.populate(cart, { path: 'items.product', select: 'price' });

  cart.totalPrice = populatedCart.items.reduce((sum, item) => {
    return sum + item.quantity * item.product.price;
  }, 0);

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

const getCartByAdmin = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(200).json({ message: "User's Cart is empty", cart: [] });
  }

  res.status(200).json({ success: true, cart });
}

const updateCart = async (req, res) => {
  const { items } = req.body; // Expecting an array of items [{ productId, quantity }, ...]

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new CustomError.BadRequestError('Please provide valid products and quantities');
  }

  let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

  if (!cart) {
    throw new CustomError.NotFoundError('Cart not found');
  }

  for (const item of items) {
    const { productId, quantity } = item;

    if (!productId || quantity < 1) {
      throw new CustomError.BadRequestError('Invalid product or quantity');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new CustomError.NotFoundError(`Product with ID ${productId} not found`);
    }

    const existingItem = cart.items.find((i) => i.product._id.toString() === productId);
    if (existingItem) {
      existingItem.quantity = quantity; // Update the quantity
    } else {
      cart.items.push({ product: productId, quantity }); // Add if not exists
    }
  }

  // Recalculate total price
  cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0);

  await cart.save();
  res.status(200).json({ success: true, cart });
};

module.exports = { updateCart };


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
  getCartByAdmin,
  removeFromCart,
  updateCart
};
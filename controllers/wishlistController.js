const WishList = require('../models/WishList');
const Product = require('../models/Product');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// ➤ Add product to wishlist
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new CustomError.NotFoundError('Product not found');
  }

  let wishlist = await WishList.findOne({ user: req.user.userId });

  if (!wishlist) {
    wishlist = new WishList({ user: req.user.userId, items: [] });
  }

  // Avoid duplicate products in wishlist
  const existingItem = wishlist.items.find(item => item.product.toString() === productId);
  if (!existingItem) {
    wishlist.items.push({ product: productId });
  }

  await wishlist.save();
  res.status(StatusCodes.CREATED).json({ message: 'Product added to wishlist', wishlist });
};

// ➤ Get user's wishlist
const getWishlist = async (req, res) => {
  const wishlist = await WishList.findOne({ user: req.user.userId }).populate('items.product');
  res.status(StatusCodes.OK).json({ wishlist });
};

// ➤ Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const wishlist = await WishList.findOne({ user: req.user.userId });

  if (!wishlist) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Wishlist not found' });
  }

  wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
  await wishlist.save();

  res.status(StatusCodes.OK).json({ message: 'Product removed from wishlist', wishlist });
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};

const Product = require('../models/Product');
const Category = require('../models/Category'); // <-- Add this import
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');


const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};


const getAllProducts = async (req, res) => {
  const products = await Product.find({})
    .populate('category') // Populates category details
    .populate({ path: 'reviews', select: 'rating comment user' }); // Populate related reviews

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getProductsBySubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;
    // Find products where the category field exactly matches the subcategory id
    const products = await Product.find({ category: subCategoryId });
    res.status(StatusCodes.OK).json({ products, count: products.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

const getProductsByParentCategory = async (req, res) => {
  try {
    const parentCategoryId = req.params.id;

    // Find all subcategories under the parent
    const subcategories = await Category.find({ parentCategory: parentCategoryId });

    // Extract IDs of subcategories
    const subcategoryIds = subcategories.map(cat => cat._id);

    // Fetch products from all these categories (including the parent itself)
    const products = await Product.find({ category: { $in: [parentCategoryId, ...subcategoryIds] } });

    res.status(200).json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  // Fetch the product and populate the category field
  const product = await Product.findOne({ _id: productId })
    .populate('category')
    .populate({ path: 'reviews', select: 'rating comment user' }); // Populates related reviews

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  // Optional: Log the populated category
  console.log(product.category); // Should show the category details

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  // Use deleteOne() instead of remove()
  await product.deleteOne();

  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No File Uploaded');
  }
  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      'Please upload image smaller than 1MB'
    );
  }

  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getProductsByParentCategory,
  getProductsBySubCategory
};

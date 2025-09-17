const Product = require('../models/Product');
const Category = require('../models/Category');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const crypto = require('crypto');


const getTrendingProducts = async (req, res) => {
  const trending = await Product.find({ isTrending: true }).limit(10);
  res.json({ products: trending });
};

const getLatestProducts = async (req, res) => {
  const latest = await Product.find().sort({ createdAt: -1 }).limit(10);
  res.json({ products: latest });
};

const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, images, sku, isTrending } = req.body;

    // ✅ Use provided SKU if exists; else generate
    const productSKU = sku && sku.trim() !== ""
      ? sku.trim()
      : "SKU-" + crypto.randomBytes(4).toString("hex");

    const product = new Product({
      name,
      price,
      description,
      category,
      images,
      isTrending: Boolean(isTrending),
      sku: productSKU,      // ✅ add it here
      user: req.user.userId,
    });

    const savedProduct = await product.save();
    res.status(StatusCodes.CREATED).json(savedProduct);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({})
    .populate('category')
    .populate({ path: 'reviews', select: 'rating comment user' });

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId })
    .populate('category')
    .populate({ path: 'reviews', select: 'rating comment user' }); // Populates related reviews

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const getProductsBySubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;
    const products = await Product.find({ category: subCategoryId });
    res.status(StatusCodes.OK).json({ products, count: products.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};
// ========================================================================================================
// const getProductsByParentCategory = async (req, res) => {
//   try {
//     const parentCategoryId = req.params.id;

//     const subcategories = await Category.find({ parentCategory: parentCategoryId });

//     // Extract IDs of subcategories
//     const subcategoryIds = subcategories.map(cat => cat._id);

//     // Fetch products from all these categories (including the parent itself)
//     const products = await Product.find({ category: { $in: [parentCategoryId, ...subcategoryIds] } });

//     res.status(200).json({ products, count: products.length });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// };

// ========================================================================================================

const getProductsByParentCategory = async (req, res) => {
  try {
    const parentCategoryId = req.params.id;

    // Step 1: Confirm this category exists and is a true parent
    const parentCategory = await Category.findById(parentCategoryId);

    if (!parentCategory) {
      return res.status(404).json({ msg: 'Parent category not found' });
    }

    if (parentCategory.parentCategory) {
      // It has a parent, so it's a subcategory — not allowed
      return res.status(400).json({ msg: 'Provided category is not a parent category' });
    }

    // Step 2: Fetch its subcategories
    const subcategories = await Category.find({ parentCategory: parentCategoryId });
    const subcategoryIds = subcategories.map((cat) => cat._id);

    // Step 3: Get products in this parent and all its subcategories
    const products = await Product.find({
      category: { $in: [parentCategoryId, ...subcategoryIds] },
    });

    res.status(200).json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = {
      ...req.body,
    };

    if (req.body.isTrending !== undefined) {
      updates.isTrending = Boolean(req.body.isTrending); // ✅ ensure boolean
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(StatusCodes.OK).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  await product.deleteOne();

  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

const cleanupOrphanProducts = async (req, res) => {
  try {
    const validCategoryIds = await Category.distinct('_id');
    const deleted = await Product.deleteMany({
      category: { $nin: validCategoryIds },
    });

    console.log(`🧹 Cleaned up ${deleted.deletedCount} orphaned products.`);
    res.status(200).json({
      message: `Deleted ${deleted.deletedCount} orphaned products.`,
    });
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
    res.status(500).json({ error: 'Failed to clean up orphaned products.' });
  }
};

module.exports = { cleanupOrphanProducts };




module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsByParentCategory,
  getProductsBySubCategory,
  getTrendingProducts,
  getLatestProducts,
  cleanupOrphanProducts
};

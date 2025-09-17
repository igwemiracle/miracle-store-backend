const Category = require('../models/Category');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createCategory = async (req, res) => {
  const { name, parentCategory } = req.body;

  // If a parentCategory is provided, verify it exists
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      throw new CustomError.NotFoundError('Parent category does not exist');
    }
  }

  // Check if the category (sub or parent) already exists under the same parent
  const existingCategory = await Category.findOne({ name, parentCategory });
  if (existingCategory) {
    throw new CustomError.NotFoundError(`Category already exists under this parent`);
  }

  // Create and save the new category
  const newCategory = new Category({ name, parentCategory });
  await newCategory.save();

  res.status(201).json({ category: newCategory });
};

const getAllCategories = async (req, res) => {
  const categories = await Category.find({ parentCategory: null }).lean(); // Get only main categories

  // Fetch subcategories for each category
  for (let category of categories) {
    category.subcategories = await Category.find({ parentCategory: category._id }).lean();
  }

  res.status(StatusCodes.OK).json({ categories });
};

const getSingleCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOne({ _id: categoryId }).lean();
  if (!category) {
    throw new CustomError.NotFoundError(`No category with id: ${categoryId}`);
  }

  // Fetch subcategories
  category.subcategories = await Category.find({ parentCategory: categoryId }).lean();

  res.status(StatusCodes.OK).json({ category });
};

const deleteCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  // 1. Check if the category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new CustomError.NotFoundError(`No category with id: ${categoryId}`);
  }

  // 2. Find all subcategories (if any)
  const subcategories = await Category.find({ parentCategory: categoryId });

  // Collect all category IDs to delete
  const categoryIdsToDelete = [categoryId, ...subcategories.map(cat => cat._id)];

  // 3. Delete products belonging to those categories
  await Product.deleteMany({ category: { $in: categoryIdsToDelete } });

  // 4. Delete subcategories
  await Category.deleteMany({ parentCategory: categoryId });

  // 5. Delete the parent category
  await category.deleteOne();

  res.status(StatusCodes.OK).json({
    msg: 'Category, subcategories, and related products deleted successfully',
  });
};


const getParentCategoriesWithSubData = async (req, res) => {
  try {
    const parents = await Category.find({ parent: null });

    const parentData = [];

    for (const parent of parents) {
      const subcategories = await Category.find({ parent: parent._id });

      console.log(`👨‍👧 Parent: ${parent.name}, Subcategories: ${subcategories.length}`);

      const subData = await Promise.all(
        subcategories.map(async (sub) => {
          const products = await Product.find({ category: sub._id }).limit(4);
          console.log(`  ↪️ Subcategory: ${sub.name}, Products: ${products.length}`);
          return { _id: sub._id, name: sub.name, products };
        })
      );

      const filteredSubData = subData.filter(sub => sub.products.length > 0);

      if (filteredSubData.length >= 4) {
        console.log(`✅ Adding parent: ${parent.name} with ${filteredSubData.length} valid subcategories`);
        parentData.push({
          parent: { _id: parent._id, name: parent.name },
          subcategories: filteredSubData.slice(0, 4),
        });
      } else {
        console.log(`❌ Skipping parent: ${parent.name}, only ${filteredSubData.length} valid subcategories`);
      }
    }

    res.json({ data: parentData });
  } catch (err) {
    console.error("❌ Failed to fetch parent category data:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;

  const parentCategory = await Category.findOne({ slug });
  if (!parentCategory) {
    return res.status(404).json({ msg: `No item found with slug: ${slug}` });
  }

  const subcategories = await Category.find({ parentCategory: parentCategory._id });

  res.json({ ...parentCategory.toObject(), subcategories });
};




module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  deleteCategory,
  getParentCategoriesWithSubData,
  getCategoryBySlug
};




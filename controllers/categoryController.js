const Category = require('../models/Category');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// 🟢 Create a New Category (Supports Subcategories)
const createCategory = async (req, res) => {
  const { name, parentCategory } = req.body;

  // If a parentCategory is provided, verify it exists
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      return res.status(400).json({ msg: 'Parent category does not exist' });
    }
  }

  // Check if the category (sub or parent) already exists under the same parent
  const existingCategory = await Category.findOne({ name, parentCategory });
  if (existingCategory) {
    return res.status(400).json({ msg: 'Category already exists under this parent' });
  }

  // Create and save the new category
  const newCategory = new Category({ name, parentCategory });
  await newCategory.save();

  res.status(201).json({ category: newCategory });
};

// 🟢 Get All Categories (With Nested Subcategories)
const getAllCategories = async (req, res) => {
  const categories = await Category.find({ parentCategory: null }).lean(); // Get only main categories

  // Fetch subcategories for each category
  for (let category of categories) {
    category.subcategories = await Category.find({ parentCategory: category._id }).lean();
  }

  res.status(StatusCodes.OK).json({ categories });
};

// 🟢 Get a Single Category (With Its Subcategories)
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

  // Find the category to delete
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new CustomError.NotFoundError(`No category with id : ${categoryId}`);
  }

  // Optionally: Delete all subcategories of this category
  await Category.deleteMany({ parentCategory: categoryId });

  // Remove the category itself
  await category.deleteOne();

  res.status(StatusCodes.OK).json({ msg: 'Category deleted successfully' });
};


module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  deleteCategory
};




const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  deleteCategory
} = require('../controllers/categoryController');


// 🟢 Public: Get all categories (including subcategories)
router.route('/').get(getAllCategories);

// 🟢 Admin only: Create a category or subcategory
router.route('/').post([authenticateUser, authorizePermissions('admin')], createCategory);

// 🟢 Public: Get single category (including its subcategories)
router.route('/:id')
  .get(getSingleCategory)
  .delete ([authenticateUser, authorizePermissions('admin')], deleteCategory);


module.exports = router;
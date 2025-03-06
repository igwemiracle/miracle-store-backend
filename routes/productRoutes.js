const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getProductsByParentCategory,
  getProductsBySubCategory
} = require('../controllers/productController');

// const { getSingleProductReviews } = require('../controllers/reviewController');

router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createProduct)
  .get(getAllProducts);


router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('admin')], uploadImage);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

// New route for getting products by parent category
router.get('/parent/:id', getProductsByParentCategory);

// NEW: Route to get products by subcategory
router.get('/subcategory/:id', getProductsBySubCategory);

// router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;

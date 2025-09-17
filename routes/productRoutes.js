const express = require('express');
const upload = require('../middleware/uploads');
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
  getProductsByParentCategory,
  getProductsBySubCategory,
  getTrendingProducts,
  getLatestProducts,
  cleanupOrphanProducts
} = require('../controllers/productController');


router
  .route('/trending')
  .get(getTrendingProducts)

router
  .route('/latest')
  .get(getLatestProducts)



// ================================================================================


router
  .route('/cleanup-orphan-products')
  .delete([authenticateUser, authorizePermissions('admin')], cleanupOrphanProducts);

// ================================================================================


router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], upload.single('image'), createProduct)


const { getSingleProductReviews } = require('../controllers/reviewController');

router
  .route('/')
  // .post([authenticateUser, authorizePermissions('admin')], createProduct)
  .get(getAllProducts);


router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

// New route for getting products by parent category
router.get('/parent/:id', getProductsByParentCategory);

// NEW: Route to get products by subcategory
router.get('/subcategory/:id', getProductsBySubCategory);

router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;




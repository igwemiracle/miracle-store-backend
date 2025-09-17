const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  deleteAllOrders,
  createPaymentIntentOnly,
  createOrderAfterPayment,
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

router.delete('/', authenticateUser, authorizePermissions('admin'), deleteAllOrders);
// NEW
router.route('/create-payment-intent').post(authenticateUser, createPaymentIntentOnly);
router.route('/create-order-after-payment').post(authenticateUser, createOrderAfterPayment);


module.exports = router;
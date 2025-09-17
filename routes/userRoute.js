const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  promoteToAdmin
} = require('../controllers/userController');

const { getOrderStatistics } = require('../A/getOrderStats');


router
  .route('/order-statistics')
  .get(authenticateUser, authorizePermissions('admin'), getOrderStatistics);


router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers);

router
  .route('/showMe')
  .get(authenticateUser, showCurrentUser);

router
  .route('/updateUser')
  .patch(authenticateUser, updateUser);

router
  .route('/updateUserPassword')
  .patch(authenticateUser, updateUserPassword);

router
  .route('/:id')
  .get(authenticateUser, getSingleUser)
  .delete(authenticateUser, authorizePermissions('admin'), deleteUser);

router
  .patch('/:id/promote', authenticateUser, authorizePermissions('admin'), promoteToAdmin);


module.exports = router;

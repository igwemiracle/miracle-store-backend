const express = require('express');
const router = express.Router();
const { addToCart, getCart, getCartByAdmin, updateCart, removeFromCart } = require('../controllers/cartController');
const {
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication');

router.post('/', authenticateUser, addToCart);
router.get('/', authenticateUser, getCart);
router.delete('/:productId', authenticateUser, removeFromCart);
router.put('/', authenticateUser, updateCart);
router.get('/admin/:userId', authenticateUser, authorizePermissions("admin"), getCartByAdmin);

module.exports = router;

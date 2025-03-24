const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCart, removeFromCart } = require('../controllers/cartController');
const {
  authenticateUser,
} = require('../middleware/authentication');

router.post('/', authenticateUser, addToCart);
router.get('/', authenticateUser, getCart);
router.delete('/:productId', authenticateUser, removeFromCart);
router.put('/', authenticateUser, updateCart);


module.exports = router;

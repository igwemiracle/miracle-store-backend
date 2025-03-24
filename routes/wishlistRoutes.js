const express = require('express');
const { authenticateUser } = require('../middleware/authentication'); // Fix: Destructure the function
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', authenticateUser, wishlistController.getWishlist);
router.post('/', authenticateUser, wishlistController.addToWishlist);
router.delete('/:productId', authenticateUser, wishlistController.removeFromWishlist);

module.exports = router;

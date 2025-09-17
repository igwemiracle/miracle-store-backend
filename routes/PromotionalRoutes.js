const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createPromotion,
  getAllPromotions,
  updatePromotion,
  deletePromotion,
  getPromotionById,
} = require('../controllers/promotionController');

// Create promo
router.post('/', [authenticateUser, authorizePermissions('admin')], createPromotion);

// Get all promos
router.get('/', getAllPromotions);

// Get promo by ID
router.get('/:id', getPromotionById);

// Update promo
router.patch('/:id', [authenticateUser, authorizePermissions('admin')], updatePromotion);

// Delete promo
router.delete('/:id', [authenticateUser, authorizePermissions('admin')], deletePromotion);

module.exports = router;

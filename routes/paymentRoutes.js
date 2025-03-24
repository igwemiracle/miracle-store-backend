const express = require('express');
const { createPayment, getUserPayments } = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authentication'); // Fix import


const router = express.Router();

router.post('/', authenticateUser, createPayment);
router.get('/', authenticateUser, getUserPayments);

module.exports = router;

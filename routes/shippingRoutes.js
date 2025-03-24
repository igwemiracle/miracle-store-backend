const express = require('express');
// const { addShippingDetails, getShippingDetails } = require('../controllers/shippingController');
const shippingController = require('../controllers/shippingController');
const { authenticateUser } = require('../middleware/authentication');


const router = express.Router();

router.post('/', authenticateUser, shippingController.addShippingDetails);
router.get('/', authenticateUser, shippingController.getShippingStatus);

module.exports = router;

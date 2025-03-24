const mongoose = require('mongoose');

const ShippingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  carrier: {
    type: String,
    default: 'UPS', // Example default carrier
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  estimatedDeliveryDate: {
    type: Date,
  },
});

module.exports = mongoose.model('Shipping', ShippingSchema);

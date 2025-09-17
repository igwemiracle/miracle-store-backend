const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User model
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Links to the Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
    },
  ],
  totalPrice: {
    type: Number,
    default: 0, // Can be updated dynamically when adding/removing items
  },
});

module.exports = mongoose.model('Cart', CartSchema);
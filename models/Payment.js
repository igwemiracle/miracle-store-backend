const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
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
  paymentIntentId: {
    type: String,
    required: true, // From Stripe or another payment provider
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  status: {
    type: String,
    enum: ['requires_payment_method', 'pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);

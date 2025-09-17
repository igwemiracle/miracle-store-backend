// 📁 models/CardConfig.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['singleImage', 'grid', 'threeImage'],
      required: true,
    },
    source: {
      type: String,
      enum: ['auto'],
      default: 'auto',
    },
    title: String,
    linkText: String,
    productId: String,
    productIds: [String],
    categoryIds: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CardConfig', cardSchema);

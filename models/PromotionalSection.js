// Example for Mongoose
const mongoose = require('mongoose');

const PromotionalSectionSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['cardGrid', 'threeBottomImage', 'singleImage'] },
  items: [
    {
      name: String,
      image: String,
    },
  ],
  linkText: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
});

module.exports = mongoose.model('PromotionalSection', PromotionalSectionSchema);
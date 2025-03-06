const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  { timestamps: true }
);

// Create a compound unique index on both name and parentCategory
CategorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);

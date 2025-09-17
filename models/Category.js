const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  slug: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

// Generate slug on save
CategorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Unique index
CategorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Links to CategorySchema
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/**
 * This allows you to populate reviews when fetching a product.
 * It does not store reviews inside the Product collection but links them dynamically.
 */
ProductSchema.virtual('reviews', {
  ref: 'Review',              // References the Review model
  localField: '_id',          // The field in ProductSchema that matches ReviewSchema
  foreignField: 'product',    // The field in ReviewSchema that refers to ProductSchema
  justOne: false,             // false means it's an array (one product can have many reviews)
});

/**
 * When a product is deleted, this ensures all reviews related to that product are also deleted.
 * Prevents orphaned reviews (reviews existing without a product).
 */
ProductSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('Product', ProductSchema);

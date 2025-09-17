const mongoose = require('mongoose');

const cardConfigSettingsSchema = new mongoose.Schema({
  useAuto: {
    type: Boolean,
    default: false,
  },
  lastUpdatedAt: {
    type: Date,
    default: null,
  },
  lastUpdatedBy: {
    type: String, // 'auto' or 'admin'
    enum: ['auto', 'admin'],
    default: null,
  },
});

module.exports = mongoose.model('CardConfigSettings', cardConfigSettingsSchema);

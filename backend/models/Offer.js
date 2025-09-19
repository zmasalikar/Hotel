const mongoose = require('mongoose');
const OfferSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  discountPercent: { type: Number, default: 0 },
  validFrom: Date,
  validTo: Date,
  active: { type: Boolean, default: true }
});
module.exports = mongoose.model('Offer', OfferSchema);

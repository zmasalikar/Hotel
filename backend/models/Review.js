const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  rating: { type: Number, min:1, max:5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false } // admin moderation
});
module.exports = mongoose.model('Review', ReviewSchema);

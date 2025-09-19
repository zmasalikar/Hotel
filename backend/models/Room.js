const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  amenities: [String],
  images: [String],
  capacity: { type: Number, default: 2 },
  bedType: String,
  size: String,
  view: String,
  createdAt: { type: Date, default: Date.now },
  // availability could be derived from bookings, keep a simple flag for quick testing
  isActive: { type: Boolean, default: true }
});
module.exports = mongoose.model('Room', RoomSchema);

const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  amenities: [{ type: String }],
  images: [{ type: String }],
  capacity: { type: Number, default: 2 },
  bedType: { type: String, default: 'Queen' },
  size: { type: String, default: '' },
  view: { type: String, default: '' },
  location: { type: String, default: '' },     // NEW
  roomType: { type: String, default: '' },    // NEW (single, double, suite, family)
  rating: { type: Number, default: 0 },       // NEW (fake/seeded average rating)
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);

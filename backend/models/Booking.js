const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  contactName: String,
  contactPhone: String,
  specialRequests: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Booking', BookingSchema);

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');
let sendBookingEmail;
try {
  sendBookingEmail = require('../utils/mailer').sendBookingEmail;
} catch (e) {
  sendBookingEmail = null;
}

function parseDateSafe(v){
  if(!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return null;
  return d;
}

// Create booking (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { room, checkIn, checkOut, guests, totalPrice, contactName, contactPhone, specialRequests } = req.body;

    const inDate = parseDateSafe(checkIn);
    const outDate = parseDateSafe(checkOut);
    const today = new Date(); today.setHours(0,0,0,0);

    if (!inDate || !outDate) return res.status(400).json({ error: 'Invalid dates' });
    if (inDate < today) return res.status(400).json({ error: 'Check-in cannot be in the past' });
    if (outDate <= inDate) return res.status(400).json({ error: 'Check-out must be after check-in' });

    const roomDoc = await Room.findById(room);
    if (!roomDoc) return res.status(404).json({ error: 'Room not found' });

    const overlapping = await Booking.findOne({
      room,
      checkIn: { $lt: outDate },
      checkOut: { $gt: inDate }
    });
    if (overlapping) return res.status(409).json({ error: 'Room not available for selected dates' });

    const booking = await Booking.create({
      room,
      user: req.user._id,
      checkIn: inDate,
      checkOut: outDate,
      guests: guests || 1,
      totalPrice: Number(totalPrice) || (roomDoc.price || 0),
      contactName: contactName || '',
      contactPhone: contactPhone || '',
      specialRequests: specialRequests || ''
    });

    try {
      if (sendBookingEmail) {
        const user = await User.findById(req.user._id);
        if (user?.email) {
          await sendBookingEmail(user.email, booking);
        }
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr?.message || emailErr);
    }

    res.status(201).json({ bookingId: booking._id, booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Get current user's bookings
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('room');
    res.json(bookings);
  } catch (err) {
    console.error('My bookings error', err);
    res.status(500).json({ error: 'Cannot fetch bookings' });
  }
});

// ADMIN: list all bookings (requires admin role)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const bookings = await Booking.find().populate('room').populate('user').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Admin bookings error', err);
    res.status(500).json({ error: 'Cannot fetch all bookings' });
  }
});

// Get single booking (owner or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room').populate('user');
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (String(booking.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(booking);
  } catch (err) {
    console.error('Fetch booking error', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { room, rating, comment } = req.body;
    if (!room || !rating) return res.status(400).json({ error: 'Missing fields' });

    const pastStay = await Booking.findOne({
      user: req.user._id,
      room,
      checkOut: { $lt: new Date() }
    });

    if (!pastStay) return res.status(400).json({ error: 'You can only review after your stay' });

    const review = await Review.create({
      user: req.user._id,
      room,
      rating,
      comment
    });

    // Optionally update room.avg rating (simple approach: not real-time aggregate)
    try {
      const agg = await Review.aggregate([
        { $match: { room: mongoose.Types.ObjectId(room) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (agg && agg[0]) {
        await Room.findByIdAndUpdate(room, { rating: agg[0].avgRating });
      }
    } catch (e) {
      // ignore
    }

    res.json(review);
  } catch (err) {
    console.error('Review POST error', err);
    res.status(500).json({ error: 'Review failed' });
  }
});

router.get('/room/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ room: req.params.id }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    console.error('Fetch reviews error', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/room/:id/average', async (req, res) => {
  try {
    const roomId = req.params.id;
    const agg = await Review.aggregate([
      { $match: { room: mongoose.Types.ObjectId(roomId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (agg && agg[0] && agg[0].count > 0) {
      return res.json({ avgRating: agg[0].avgRating, count: agg[0].count, source: 'reviews' });
    }

    // fallback to seeded room.rating
    const room = await Room.findById(roomId);
    const fallback = room?.rating || 0;
    res.json({ avgRating: fallback, count: 0, source: 'room' });
  } catch (err) {
    console.error('Average fetch error', err);
    res.status(500).json({ error: 'Failed to fetch average' });
  }
});

module.exports = router;

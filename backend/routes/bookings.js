const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// POST /api/bookings - create booking (user must be authenticated)
router.post('/', auth, async (req,res)=>{
  try{
    const data = req.body;
    data.user = req.user._id;
    const booking = new Booking(data);
    await booking.save();
    res.status(201).json(booking);
  }catch(err){ res.status(400).json({error:err.message}); }
});

// GET /api/bookings/my - user's bookings
router.get('/my', auth, async (req,res)=>{
  const bookings = await Booking.find({user: req.user._id}).populate('room');
  res.json(bookings);
});

// ADMIN: list all bookings
router.get('/', async (req,res)=>{
  const bookings = await Booking.find().populate('room').populate('user');
  res.json(bookings);
});

module.exports = router;

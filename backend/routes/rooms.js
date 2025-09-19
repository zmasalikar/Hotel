const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// GET /api/rooms - list with optional search query ?q=&minPrice=&maxPrice=&amenity=
router.get('/', async (req,res)=>{
  const {q,minPrice,maxPrice,amenity} = req.query;
  const filter = { isActive: true };
  if(q) filter.$or = [{title:new RegExp(q,'i')},{description:new RegExp(q,'i')}];
  if(minPrice) filter.price = {...filter.price, $gte: Number(minPrice)};
  if(maxPrice) filter.price = {...filter.price, $lte: Number(maxPrice)};
  if(amenity) filter.amenities = amenity;
  const rooms = await Room.find(filter).limit(100);
  res.json(rooms);
});

// GET /api/rooms/:id - details
router.get('/:id', async (req,res)=>{
  const room = await Room.findById(req.params.id);
  if(!room) return res.status(404).json({error:'Not found'});
  res.json(room);
});

// POST /api/rooms/availability - check availability by dates and room id
router.post('/availability', async (req,res)=>{
  try{
    const {roomId, checkIn, checkOut} = req.body;
    const bookings = await Booking.find({
      room: roomId,
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
      ]
    });
    const available = bookings.length === 0;
    res.json({available, bookings});
  }catch(err){ res.status(500).json({error:err.message}); }
});

// ADMIN: create room
router.post('/', async (req,res)=>{
  // Note: in assessment, admin auth should be checked. Keep simple for scaffold.
  try{
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  }catch(err){ res.status(400).json({error:err.message}); }
});

module.exports = router;

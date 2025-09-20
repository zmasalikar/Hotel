// backend/routes/rooms.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads dir
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// GET /api/rooms - with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      amenities,
      roomType,
      location,
      checkIn,
      checkOut,
      minRating
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (roomType) filter.roomType = roomType;
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (amenities) {
      const arr = amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (arr.length) filter.amenities = { $all: arr };
    }

    if (minRating) filter.rating = { $gte: Number(minRating) };

    let roomsQuery = Room.find(filter);

    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const busyRoomIds = await Booking.find({
        checkIn: { $lt: outDate },
        checkOut: { $gt: inDate }
      }).distinct('room');

      if (busyRoomIds && busyRoomIds.length > 0) {
        roomsQuery = roomsQuery.where('_id').nin(busyRoomIds.map(id => mongoose.Types.ObjectId(id)));
      }
    }

    const rooms = await roomsQuery.sort({ createdAt: -1 }).limit(200).exec();
    res.json(rooms);
  } catch (err) {
    console.error('Rooms list error:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST /api/rooms/availability
router.post('/availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;
    if (!roomId || !checkIn || !checkOut) return res.status(400).json({ error: 'Missing params' });
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    const bookings = await Booking.find({
      room: roomId,
      checkIn: { $lt: outDate },
      checkOut: { $gt: inDate }
    });

    const available = bookings.length === 0;
    res.json({ available, bookings });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// ADMIN: create room (supports multipart/form-data with images)
router.post('/', auth, upload.array('images', 8), async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    // fields in req.body
    const {
      title,
      slug,
      description,
      price,
      amenities,
      capacity,
      bedType,
      size,
      view,
      location,
      roomType,
      rating,
      isActive
    } = req.body;

    const images = [];
    if (req.files && req.files.length) {
      req.files.forEach(f => {
        // serve via /uploads
        const url = `${req.protocol}://${req.get('host')}/uploads/${f.filename}`;
        images.push(url);
      });
    } else if (req.body.images && typeof req.body.images === 'string') {
      // support a comma-separated list of image URLs
      const arr = req.body.images.split(',').map(s => s.trim()).filter(Boolean);
      images.push(...arr);
    }

    const room = new Room({
      title,
      slug: slug || (title || '').toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      price: Number(price) || 0,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(a=>a.trim()).filter(Boolean)) : [],
      images,
      capacity: Number(capacity) || 2,
      bedType: bedType || '',
      size: size || '',
      view: view || '',
      location: location || '',
      roomType: roomType || '',
      rating: rating ? Number(rating) : 0,
      isActive: isActive === 'false' ? false : true
    });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(400).json({ error: err.message || 'Failed to create room' });
  }
});

module.exports = router;

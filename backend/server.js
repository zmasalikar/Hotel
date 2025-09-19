require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const bookingsRoutes = require('./routes/bookings');
const reviewsRoutes = require('./routes/reviews');
const offersRoutes = require('./routes/offers');
const paymentsRoutes = require('./routes/payments');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking')
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

app.get('/', (req,res) => res.json({ok:true, msg:'Hotel Booking Backend'}));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/payments', paymentsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));

// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Room = require('./models/Room');
const Offer = require('./models/Offer');
const User = require('./models/User');
const Booking = require('./models/Booking');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking';

async function seed() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Connected to MongoDB for seeding');

  await Booking.deleteMany({});
  await Room.deleteMany({});
  await Offer.deleteMany({});

  const rooms = [
    {
      title: 'Deluxe Suite',
      slug: 'deluxe-suite',
      description: 'Spacious suite with king bed and sea view.',
      price: 150,
      amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Breakfast', 'Kitchen'],
      images: [
        'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1501117716987-c8e6d28e3f44?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80&auto=format&fit=crop'
      ],
      capacity: 2,
      bedType: 'King',
      size: '35m²',
      view: 'Sea',
      location: 'Goa',
      roomType: 'suite',
      rating: 4.7
    },
    {
      title: 'Standard Room',
      slug: 'standard-room',
      description: 'Comfortable room with queen bed, ideal for short stays.',
      price: 80,
      amenities: ['WiFi', 'AC', 'TV', 'Kitchen'],
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1471115853179-bb1d604434e0?w=1200&q=80&auto=format&fit=crop'
      ],
      capacity: 2,
      bedType: 'Queen',
      size: '22m²',
      view: 'City',
      location: 'Mumbai',
      roomType: 'double',
      rating: 4.0
    },
    {
      title: 'Family Room',
      slug: 'family-room',
      description: 'Large family room with two queen beds and garden view.',
      price: 160,
      amenities: ['WiFi', 'AC', 'Kitchen', 'TV'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=1200&q=80&auto=format&fit=crop'
      ],
      capacity: 4,
      bedType: 'Two Queen',
      size: '45m²',
      view: 'Garden',
      location: 'Bangalore',
      roomType: 'family',
      rating: 4.3
    },
    {
      title: 'Economy Single',
      slug: 'economy-single',
      description: 'Budget single room for solo travelers.',
      price: 45,
      amenities: ['WiFi', 'AC'],
      images: [
        'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500336624523-d727130c3328?w=1200&q=80&auto=format&fit=crop'
      ],
      capacity: 1,
      bedType: 'Single',
      size: '14m²',
      view: 'Street',
      location: 'Pune',
      roomType: 'single',
      rating: 3.8
    },
    {
      title: 'Executive Double',
      slug: 'executive-double',
      description: 'Executive double room with workspace and city view.',
      price: 110,
      amenities: ['WiFi', 'AC', 'TV', 'Workspace', 'Kitchen'],
      images: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533777324565-a040eb52fac2?w=1200&q=80&auto=format&fit=crop'
      ],
      capacity: 2,
      bedType: 'Double',
      size: '28m²',
      view: 'City',
      location: 'Delhi',
      roomType: 'double',
      rating: 4.4
    },
    {
      title: 'Penthouse Suite',
      slug: 'penthouse-suite',
      description: 'Luxury penthouse with panoramic views and private terrace.',
      price: 320,
      amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Breakfast', 'Kitchen'],
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555992336-03a23c4f6a38?w=1200&q=80&auto=format&fit=crop'
      ],
      capacity: 4,
      bedType: 'King',
      size: '75m²',
      view: 'City',
      location: 'Bengaluru',
      roomType: 'suite',
      rating: 4.9
    }
  ];

  const createdRooms = await Room.insertMany(rooms);
  console.log('Inserted sample rooms with real images');

  const offers = [
    {
      code: 'WELCOME10',
      description: '10% off first booking',
      discountPercent: 10,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      active: true
    },
    {
      code: 'FALL20',
      description: '20% fall discount',
      discountPercent: 20,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      active: true
    }
  ];
  await Offer.insertMany(offers);
  console.log('Inserted offers');

  const testEmail = 'testuser@example.com';
  const adminEmail = 'admin@example.com';

  let user = await User.findOne({ email: testEmail });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Test@1234', salt);
    user = await User.create({ name: 'Test User', email: testEmail, passwordHash: hash, role: 'user' });
    console.log('Created test user', testEmail, '/ Test@1234');
  }

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin@1234', salt);
    admin = await User.create({ name: 'Admin User', email: adminEmail, passwordHash: hash, role: 'admin' });
    console.log('Created admin', adminEmail, '/ Admin@1234');
  }

  // Create one past booking for test user (so review can be submitted)
  try {
    const roomForPast = createdRooms[0]; // Deluxe Suite
    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 10);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckIn.getDate() + 3);
    await Booking.create({
      room: roomForPast._id,
      user: user._id,
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      guests: 2,
      totalPrice: roomForPast.price * 3,
      paymentStatus: 'paid',
      contactName: 'Test User',
      contactPhone: '9999999999'
    });
    console.log('Created a past booking for test user (for reviews).');
  } catch (e) {
    console.error('Failed creating past booking:', e.message || e);
  }

 try {
    const roomForFuture = createdRooms[1]; // Standard Room
    const futureCheckIn = new Date();
    futureCheckIn.setDate(futureCheckIn.getDate() + 7);
    const futureCheckOut = new Date();
    futureCheckOut.setDate(futureCheckIn.getDate() + 3);
    await Booking.create({
      room: roomForFuture._id,
      user: user._id,
      checkIn: futureCheckIn,
      checkOut: futureCheckOut,
      guests: 2,
      totalPrice: roomForFuture.price * 3,
      paymentStatus: 'paid',
      contactName: 'Test User',
      contactPhone: '9999999999'
    });
    console.log('Created a future booking to test availability blocking.');
  } catch (e) {
    console.error('Failed creating future booking:', e.message || e);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

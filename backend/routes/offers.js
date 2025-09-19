const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

// list active offers
router.get('/', async (req,res)=>{
  const now = new Date();
  const offers = await Offer.find({ active: true, $or: [ { validFrom: { $exists: false } }, { validFrom: { $lte: now } } ], $or: [ { validTo: { $exists: false } }, { validTo: { $gte: now } } ] }).limit(50);
  res.json(offers);
});

// create offer (admin)
router.post('/', async (req,res)=>{
  const offer = new Offer(req.body);
  await offer.save();
  res.status(201).json(offer);
});

module.exports = router;

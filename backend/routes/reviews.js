const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// POST /api/reviews - submit review (auth)
router.post('/', auth, async (req,res)=>{
  try{
    const review = new Review({...req.body, user: req.user._id});
    await review.save();
    res.status(201).json(review);
  }catch(err){ res.status(400).json({error:err.message}); }
});

// GET /api/reviews/room/:roomId
router.get('/room/:roomId', async (req,res)=>{
  const reviews = await Review.find({room: req.params.roomId, approved: true}).populate('user','name');
  res.json(reviews);
});

// ADMIN: approve review
router.patch('/:id/approve', async (req,res)=>{
  const r = await Review.findByIdAndUpdate(req.params.id, {approved:true}, {new:true});
  res.json(r);
});

module.exports = router;

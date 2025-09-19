const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req,res)=>{
  try{
    const {name,email,password} = req.body;
    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({error:'Email exists'});
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({name,email,passwordHash:hash});
    await user.save();
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET || 'change-me', {expiresIn:'7d'});
    res.json({token, user:{id:user._id,name:user.name,email:user.email}});
  }catch(err){ res.status(500).json({error:err.message}); }
});

// POST /api/auth/login
router.post('/login', async (req,res)=>{
  try{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({error:'Invalid creds'});
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if(!ok) return res.status(400).json({error:'Invalid creds'});
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET || 'change-me', {expiresIn:'7d'});
    res.json({token, user:{id:user._id,name:user.name,email:user.email}});
  }catch(err){ res.status(500).json({error:err.message}); }
});

module.exports = router;

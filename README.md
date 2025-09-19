# Hotel Booking System — MERN Starter (Assessment-ready)

Minimal but featureful scaffold for the Hotel Booking System assessment.

Features included:
- MERN backend with models: User, Room, Booking, Review, Offer
- Express routes for auth (JWT stub), rooms (search/filter/availability), bookings, reviews, offers, admin
- Stripe payment intent placeholder (server-side) — set STRIPE_SECRET_KEY in .env to enable
- React frontend using TailwindCSS (pages: Home, Search, Room details, Booking flow, Profile, Admin stub)
- Tailwind configuration included
- Quick deploy instructions for Render (backend) and Netlify (frontend)

## Quick start (local)
1. Install Node.js (v18+ recommended) and npm.
2. Start backend:
   ```
   cd backend
   npm install
   cp .env.example .env
   # set MONGO_URI and STRIPE_SECRET_KEY in .env if using Stripe
   npm run dev
   ```
3. Start frontend:
   ```
   cd frontend
   npm install
   npm start
   ```
4. Open frontend at http://localhost:3000 and backend at http://localhost:5000

## Deploy
- Frontend: Netlify (build command `npm run build`, publish `frontend/build`)
- Backend: Render (or Heroku) — set environment variables MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY

## Notes
- This scaffold is for learning and the assessment — further security/hardening needed for production.
- Do not include any company names in the codebase (per terms).

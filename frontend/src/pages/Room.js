import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import getApi from '../utils/api';

export default function Room() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [available, setAvailable] = useState(null);
  const [message, setMessage] = useState('');

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [canReview, setCanReview] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetch = async () => {
      try {
        const api = getApi();
        const r = await api.get(`/api/rooms/${id}`);
        setRoom(r.data || null);
      } catch (e) {}
      fetchReviews();
      fetchAvg();
      fetchMyBookings();
    };
    fetch();
    // eslint-disable-next-line
  }, [id]);

  const fetchReviews = async () => {
    try {
      const api = getApi();
      const res = await api.get(`/api/reviews/room/${id}`);
      setReviews(res.data || []);
    } catch (e) {}
  };

  const fetchAvg = async () => {
    try {
      const api = getApi();
      const res = await api.get(`/api/reviews/room/${id}/average`);
      if (res.data) {
        setAvgRating(res.data.avgRating || 0);
      }
    } catch (e) {}
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const api = getApi();
      const res = await api.get('/api/bookings/my');
      const now = new Date();
      const eligible = (res.data || []).some(b => b.room && (b.room._id === id || b.room._id === String(id)) && new Date(b.checkOut) < now);
      setCanReview(eligible);
    } catch (e) {}
  };

  const parseDate = (isoString) => {
    if (!isoString) return null;
    const [y, m, d] = isoString.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const validateDates = () => {
    setMessage('');
    const inDate = parseDate(checkIn);
    const outDate = parseDate(checkOut);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!inDate || !outDate) {
      setMessage('Please choose both check-in and check-out dates.');
      return false;
    }
    if (inDate < today) {
      setMessage('Check-in cannot be in the past.');
      return false;
    }
    if (outDate <= inDate) {
      setMessage('Check-out must be after check-in.');
      return false;
    }
    return true;
  };

  const computeCheckOutMin = () => {
    if (!checkIn) {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      return t.toISOString().split('T')[0];
    }
    const inDate = parseDate(checkIn);
    inDate.setDate(inDate.getDate() + 1);
    return inDate.toISOString().split('T')[0];
  };

  const checkAvailability = async () => {
    setAvailable(null);
    setMessage('');
    if (!validateDates()) return;
    try {
      const api = getApi();
      const res = await api.post('/api/rooms/availability', { roomId: id, checkIn, checkOut });
      setAvailable(res.data.available);
    } catch (e) {
      setMessage('Availability check failed.');
    }
  };

  const book = async () => {
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) { setMessage('You must login to book'); return; }
    if (!validateDates()) return;
    if (!contactName) { setMessage('Enter your full name'); return; }

    const nights = (parseDate(checkOut) - parseDate(checkIn)) / (1000 * 60 * 60 * 24);
    if (nights <= 0) { setMessage('Check-out must be after check-in'); return; }

    let price = (room?.price || 0) * nights;
    if (offerCode) {
      try {
        const api = getApi();
        const offers = await api.get('/api/offers');
        const match = offers.data.find(o => o.code === offerCode && o.active);
        if (match) price = price * (1 - (match.discountPercent / 100));
        else { setMessage('Offer code invalid or expired'); return; }
      } catch (e) { setMessage('Offer check failed'); return; }
    }

    try {
      const api = getApi();
      const res = await api.post('/api/bookings', {
        room: id,
        checkIn,
        checkOut,
        guests,
        totalPrice: price,
        contactName,
        contactPhone,
        specialRequests
      });
      window.location.href = `${process.env.REACT_APP_FRONTEND_URL || ''}/confirmation/${res.data.bookingId}`;
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Booking failed');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) { setMessage('Login to review'); return; }
    if (!canReview) { setMessage('Only guests who completed a stay can submit reviews.'); return; }
    try {
      const api = getApi();
      await api.post('/api/reviews', { room: id, rating, comment });
      setComment('');
      setRating(5);
      fetchReviews();
      fetchAvg();
      setMessage('Review submitted');
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Review failed');
    }
  };

  if (!room) return <div>Loading...</div>;

  const imgs = room.images && room.images.length ? room.images : ['https://via.placeholder.com/800x500?text=No+image'];

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold">{room.title}</h2>
      <p className="mt-2">{room.description}</p>

      <div className="mt-4 md:flex gap-6">
        <div className="md:w-2/3">
          <div className="relative">
            <img src={imgs[activeImage]} alt="room" className="w-full h-80 object-cover rounded" />
            <button
              onClick={() => setActiveImage((activeImage - 1 + imgs.length) % imgs.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
            >‹</button>
            <button
              onClick={() => setActiveImage((activeImage + 1) % imgs.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
            >›</button>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto">
            {imgs.map((u, i) => (
              <img
                key={u + i}
                src={u}
                alt={`thumb-${i}`}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-14 object-cover rounded cursor-pointer border ${i === activeImage ? 'ring-2 ring-blue-500' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="flex flex-col gap-2">
            <p className="font-bold text-lg">${room.price} / night</p>
            {room.location && <p className="text-sm">Location: {room.location}</p>}
            {room.roomType && <p className="text-sm">Type: {room.roomType}</p>}
            {room.bedType && <p className="text-sm">Bed: {room.bedType}</p>}
            {room.size && <p className="text-sm">Size: {room.size}</p>}
            {room.view && <p className="text-sm">View: {room.view}</p>}
            <p className="mt-1 text-yellow-600">Average Rating: {avgRating.toFixed(1)}/5</p>

            <div className="mt-3">
              <label className="block">Check-in</label>
              <input type="date" value={checkIn} min={todayISO} onChange={e => setCheckIn(e.target.value)} className="border p-2 rounded w-full" />
              <label className="block mt-2">Check-out</label>
              <input type="date" value={checkOut} min={computeCheckOutMin()} onChange={e => setCheckOut(e.target.value)} className="border p-2 rounded w-full" />
              <label className="block mt-2">Guests</label>
              <input type="number" value={guests} onChange={e => setGuests(Number(e.target.value))} className="border p-2 rounded w-full" min="1" />
              <label className="block mt-2">Full Name</label>
              <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="border p-2 rounded w-full" />
              <label className="block mt-2">Phone</label>
              <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="border p-2 rounded w-full" />
              <label className="block mt-2">Special Requests</label>
              <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className="border p-2 rounded w-full" />
              <div className="mt-3 flex items-center">
                <button onClick={checkAvailability} className="px-3 py-2 bg-green-600 text-white rounded mr-3">Check availability</button>
                <input placeholder="Offer code (optional)" value={offerCode} onChange={e => setOfferCode(e.target.value)} className="border p-2 rounded mr-3" />
                <button onClick={book} className="px-3 py-2 bg-blue-600 text-white rounded">Book (pay later)</button>
              </div>
              {available === true && <p className="mt-2 text-green-700">Available!</p>}
              {available === false && <p className="mt-2 text-red-700">Not available for selected dates.</p>}
              {message && <p className="mt-2 text-red-700">{message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Amenities</h3>
        <ul className="list-disc ml-6">
          {room.amenities?.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Reviews</h3>
        {reviews.length ? reviews.map(r => (
          <div key={r._id} className="border p-3 rounded mb-2">
            <div className="text-sm font-semibold">{r.user?.name || 'Guest'}</div>
            <div className="text-sm">Rating: {r.rating}/5</div>
            <div className="text-sm">{r.comment}</div>
          </div>
        )) : <p>No direct guest reviews yet. Showing seeded rating above.</p>}
      </div>

      {canReview ? (
        <form onSubmit={submitReview} className="mt-4">
          <h4 className="font-semibold mb-2">Leave a review</h4>
          <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border p-2 rounded w-full mb-2">
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - OK</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Terrible</option>
          </select>
          <textarea value={comment} onChange={e => setComment(e.target.value)} className="border p-2 rounded w-full mb-2" placeholder="Write your review..." />
          <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit">Submit Review</button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-gray-600">Only guests who completed a stay can submit reviews.</p>
      )}
    </div>
  );
}
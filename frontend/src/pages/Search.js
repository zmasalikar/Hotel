// frontend/src/pages/Search.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Search() {
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [roomType, setRoomType] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [amenities, setAmenities] = useState('');
  const [minRating, setMinRating] = useState('');
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState('');

  const todayISO = new Date().toISOString().split('T')[0];

  const search = async () => {
    setMessage('');
    try {
      const params = {};
      if (q) params.search = q;
      if (location) params.location = location;
      if (roomType) params.roomType = roomType;
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (amenities) params.amenities = amenities;
      if (minRating) params.minRating = minRating;

      const res = await axios.get(`${API_BASE}/api/rooms`, { params });
      setRooms(res.data || []);
      if (!res.data || res.data.length === 0) setMessage('No rooms found.');
    } catch (err) {
      console.error(err);
      setMessage('Search failed');
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Search by name or description"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <select className="border p-2 rounded" value={roomType} onChange={e => setRoomType(e.target.value)}>
            <option value="">Any type</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
            <option value="family">Family</option>
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <input
            type="date"
            className="border p-2 rounded"
            value={checkIn}
            min={todayISO}
            onChange={e => setCheckIn(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={checkOut}
            min={checkIn || todayISO}
            onChange={e => setCheckOut(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Amenities (comma separated)"
            value={amenities}
            onChange={e => setAmenities(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <input
            className="border p-2 rounded"
            placeholder="Min price"
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Max price"
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
          <select className="border p-2 rounded" value={minRating} onChange={e => setMinRating(e.target.value)}>
            <option value="">Min rating</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        <div className="flex items-center mt-3">
          <button onClick={search} className="px-4 py-2 bg-blue-600 text-white rounded mr-3">Search</button>
          <button
            onClick={() => {
              setQ(''); setLocation(''); setRoomType(''); setCheckIn(''); setCheckOut(''); setMinPrice(''); setMaxPrice(''); setAmenities(''); setMinRating(''); setRooms([]); setMessage('');
            }}
            className="px-3 py-2 bg-gray-200 rounded"
          >
            Reset
          </button>
        </div>

        {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map(r => (
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm">{r.description}</p>
            <p className="mt-2 font-bold">${r.price} / night</p>
            {r.location && <p className="text-sm">Location: {r.location}</p>}
            {r.roomType && <p className="text-sm">Type: {r.roomType}</p>}
            <Link to={`/room/${r._id}`} className="inline-block mt-3 text-blue-600">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

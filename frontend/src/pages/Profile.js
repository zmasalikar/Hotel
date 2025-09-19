import React, {useEffect, useState} from 'react';
import axios from 'axios';

export default function Profile(){
  const [bookings, setBookings] = useState([]);
  useEffect(()=>{
    // NOTE: this example assumes authentication headers stored in localStorage.token (simplified)
    const token = localStorage.getItem('token');
    if(!token) return;
    axios.get(`${process.env.REACT_APP_API_URL||'http://localhost:5000'}/api/bookings/my`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r=>setBookings(r.data)).catch(()=>{});
  },[]);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      {bookings.length ? bookings.map(b=>(
        <div key={b._id} className="bg-white p-4 rounded shadow mb-3">
          <div>{b.room?.title} — {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}</div>
          <div className="font-semibold">${b.totalPrice} — {b.paymentStatus}</div>
        </div>
      )) : <div>No bookings found. Log in and book a room.</div>}
    </div>
  );
}

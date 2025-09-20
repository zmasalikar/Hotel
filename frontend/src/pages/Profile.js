import React, { useEffect, useState } from 'react';
import getApi from '../utils/api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function Profile() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const api = getApi();
        const res = await api.get('/api/bookings/my');
        setBookings(res.data);
      } catch (err) {}
    };
    fetchBookings();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      {bookings.length === 0 && <p>No bookings found.</p>}
      {bookings.map(b => (
        <div key={b._id} className="border p-4 rounded mb-4">
          <h3 className="font-semibold">{b.room?.title}</h3>
          <p>{new Date(b.checkIn).toDateString()} - {new Date(b.checkOut).toDateString()}</p>
          <p>Guests: {b.guests}</p>
          <p>Total Price: ${b.totalPrice}</p>
          <p>Status: {b.paymentStatus}</p>
          {b.paymentStatus !== 'paid' && (
            <Elements stripe={stripePromise}>
              <CheckoutForm bookingId={b._id} amount={b.totalPrice * 100} />
            </Elements>
          )}
        </div>
      ))}
    </div>
  );
}

// frontend/src/pages/Confirmation.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import getApi from '../utils/api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function Confirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const api = getApi();
      const res = await api.get(`/api/bookings/${id}`);
      setBooking(res.data);
    } catch (e) {
      setError('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div className="p-6">Booking not found.</div>;

  const handlePaymentSuccess = async () => {
    setPaying(false);
    await fetchBooking();
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>

      <div className="mb-4">
        <p><strong>Room:</strong> {booking.room?.title}</p>
        <p><strong>Check-in:</strong> {new Date(booking.checkIn).toDateString()}</p>
        <p><strong>Check-out:</strong> {new Date(booking.checkOut).toDateString()}</p>
        <p><strong>Guests:</strong> {booking.guests}</p>
        <p><strong>Total:</strong> ${booking.totalPrice}</p>
        <p><strong>Status:</strong> {booking.paymentStatus}</p>
      </div>

      {booking.paymentStatus !== 'paid' && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Pay now</h3>
          <p className="mb-3 text-sm text-gray-600">Securely pay for your booking using card.</p>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              bookingId={booking._id}
              amount={Math.round((booking.totalPrice || 0) * 100)}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>

          {paying && <p className="mt-2">Processing payment…</p>}
        </div>
      )}

      {error && <p className="mt-3 text-red-600">{error}</p>}
    </div>
  );
}

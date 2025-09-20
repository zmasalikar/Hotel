// frontend/src/components/CheckoutForm.js
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import getApi from '../utils/api';

export default function CheckoutForm({ bookingId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const api = getApi();
      const intentRes = await api.post('/api/payments/create-payment-intent', {
        amount,
        bookingId
      });
      const clientSecret = intentRes.data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (result.error) {
        setMessage(result.error.message || 'Payment failed');
      } else {
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          await api.patch(`/api/payments/${bookingId}/pay`);
          setMessage('Payment successful');
          if (onSuccess) onSuccess();
        } else {
          setMessage('Payment processing. Please check your email for confirmation.');
        }
      }
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="p-4 border rounded">
        <div className="mb-3">
          <label className="block mb-1">Card details</label>
          <div className="p-2 border rounded">
            <CardElement />
          </div>
        </div>

        <div className="text-sm mb-3">
          <a
            href="https://docs.stripe.com/testing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Test cards &amp; numbers (Stripe)
          </a>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Processing…' : 'Pay'}
        </button>

        {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
      </form>
    </div>
  );
}
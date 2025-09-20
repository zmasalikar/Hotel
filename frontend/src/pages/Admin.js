// frontend/src/pages/Admin.js
import React, { useEffect, useState } from 'react';
import getApi from '../utils/api';

export default function Admin() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  // form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    amenities: '',
    capacity: '2',
    bedType: '',
    size: '',
    view: '',
    location: '',
    roomType: '',
    rating: '',
    images: [] // FileList or URLs
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = getApi();
        const r = await api.get('/api/rooms');
        setRooms(r.data || []);
      } catch (err) {
        console.error(err);
      }
      try {
        const api = getApi();
        const b = await api.get('/api/bookings');
        setBookings(b.data || []);
      } catch (err) {
        console.error('Bookings fetch error', err);
        setError(err?.response?.data?.error || 'Failed to load bookings (are you admin?)');
      }
    };
    fetchData();
  }, []);

  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm(prev => ({ ...prev, images: files }));
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewImages(urls);
  };

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreateMsg('');
    setCreating(true);
    try {
      const api = getApi();
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('slug', form.slug);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('amenities', form.amenities); // comma-separated
      fd.append('capacity', form.capacity);
      fd.append('bedType', form.bedType);
      fd.append('size', form.size);
      fd.append('view', form.view);
      fd.append('location', form.location);
      fd.append('roomType', form.roomType);
      fd.append('rating', form.rating);

      if (form.images && form.images.length) {
        form.images.forEach((f) => fd.append('images', f));
      }

      const res = await api.post('/api/rooms', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCreateMsg('Room created');
      // refresh list
      const r = await api.get('/api/rooms');
      setRooms(r.data || []);
      setForm({
        title: '',
        slug: '',
        description: '',
        price: '',
        amenities: '',
        capacity: '2',
        bedType: '',
        size: '',
        view: '',
        location: '',
        roomType: '',
        rating: '',
        images: []
      });
      setPreviewImages([]);
    } catch (err) {
      console.error('Create error', err);
      setCreateMsg(err?.response?.data?.error || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      <h3 className="text-xl font-semibold mb-2">Add new room</h3>
      <form onSubmit={submitCreate} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid md:grid-cols-2 gap-3">
          <input placeholder="Title" value={form.title} onChange={e => handleChange('title', e.target.value)} className="border p-2 rounded" required />
          <input placeholder="Slug (optional)" value={form.slug} onChange={e => handleChange('slug', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Location" value={form.location} onChange={e => handleChange('location', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Room type (suite, double...)" value={form.roomType} onChange={e => handleChange('roomType', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Price" type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Capacity" type="number" value={form.capacity} onChange={e => handleChange('capacity', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Bed Type" value={form.bedType} onChange={e => handleChange('bedType', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Size" value={form.size} onChange={e => handleChange('size', e.target.value)} className="border p-2 rounded" />
          <input placeholder="View" value={form.view} onChange={e => handleChange('view', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Rating (e.g. 4.5)" value={form.rating} onChange={e => handleChange('rating', e.target.value)} className="border p-2 rounded" />
          <input placeholder="Amenities (comma separated, exact case)" value={form.amenities} onChange={e => handleChange('amenities', e.target.value)} className="border p-2 rounded" />
          <input type="file" multiple accept="image/*" onChange={onFileChange} className="border p-2 rounded" />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => handleChange('description', e.target.value)} className="border p-2 rounded w-full mt-3" />
        <div className="mt-3">
          <button type="submit" disabled={creating} className="px-3 py-2 bg-green-600 text-white rounded">
            {creating ? 'Creating...' : 'Create Room'}
          </button>
          <span className="ml-3 text-sm text-green-700">{createMsg}</span>
        </div>

        {previewImages.length > 0 && (
          <div className="mt-3 flex gap-2">
            {previewImages.map((u, i) => <img key={i} src={u} alt={'preview' + i} className="w-24 h-16 object-cover rounded" />)}
          </div>
        )}
      </form>

      <h3 className="text-xl font-semibold mb-2">Rooms</h3>
      {rooms.length === 0 && <p>No rooms found.</p>}
      <ul className="mb-6">
        {rooms.map(r => (
          <li key={r._id} className="border p-3 rounded mb-2 flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-600">${r.price} • {r.location} • {r.roomType}</div>
            </div>
            <div>
              <button className="mr-2 px-2 py-1 bg-yellow-200 rounded">Edit</button>
              <button className="px-2 py-1 bg-red-200 rounded">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Bookings</h3>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {bookings.length === 0 && <p>No bookings found.</p>}
      <ul>
        {bookings.map(b => (
          <li key={b._id} className="border p-3 rounded mb-2">
            <div><strong>Room:</strong> {b.room?.title || b.room}</div>
            <div><strong>User:</strong> {b.user?.name || b.user?.email || 'N/A'}</div>
            <div>{new Date(b.checkIn).toDateString()} - {new Date(b.checkOut).toDateString()}</div>
            <div>Guests: {b.guests} | Status: {b.paymentStatus}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

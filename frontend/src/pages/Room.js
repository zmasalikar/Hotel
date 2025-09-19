import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Room(){
  const {id} = useParams();
  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [available, setAvailable] = useState(null);

  useEffect(()=>{ axios.get(`${process.env.REACT_APP_API_URL||'http://localhost:5000'}/api/rooms/${id}`).then(r=>setRoom(r.data)).catch(()=>{}); },[id]);

  const check = async ()=>{
    const res = await axios.post(`${process.env.REACT_APP_API_URL||'http://localhost:5000'}/api/rooms/availability`, { roomId: id, checkIn, checkOut });
    setAvailable(res.data.available);
  };

  if(!room) return <div>Loading...</div>;
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold">{room.title}</h2>
      <p className="mt-2">{room.description}</p>
      <p className="mt-2 font-bold">${room.price} / night</p>

      <div className="mt-4">
        <label className="block">Check-in</label>
        <input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="border p-2 rounded" />
        <label className="block mt-2">Check-out</label>
        <input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="border p-2 rounded" />
        <button onClick={check} className="mt-3 px-3 py-2 bg-green-600 text-white rounded">Check availability</button>
        {available === true && <p className="mt-2 text-green-700">Available!</p>}
        {available === false && <p className="mt-2 text-red-700">Not available for selected dates.</p>}
      </div>
    </div>
  );
}

import React, {useState} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Search(){
  const [q, setQ] = useState('');
  const [rooms, setRooms] = useState([]);
  const search = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms`, { params: { q }});
    setRooms(res.data || []);
  };
  return (
    <div>
      <div className="mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or desc" className="border p-2 rounded mr-2" />
        <button onClick={search} className="px-3 py-2 bg-blue-600 text-white rounded">Search</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.length ? rooms.map(r=>(
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm">{r.description}</p>
            <p className="mt-2 font-bold">${r.price} / night</p>
            <Link to={`/room/${r._id}`} className="inline-block mt-3 text-blue-600">View</Link>
          </div>
        )) : <div>No rooms yet. Try a search.</div>}
      </div>
    </div>
  );
}

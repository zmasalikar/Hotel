import React from 'react';
import { Link } from 'react-router-dom';

export default function Home(){
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Find & Book Hotels</h1>
      <p className="mb-6">Search rooms, check availability, and book securely.</p>
      <Link to="/search" className="px-4 py-2 bg-blue-600 text-white rounded">Search Rooms</Link>
    </div>
  );
}

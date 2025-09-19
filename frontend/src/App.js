import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Room from './pages/Room';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App(){
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Hotel Booking</Link>
          <nav className="space-x-4">
            <Link to="/search" className="text-sm">Search</Link>
            <Link to="/profile" className="text-sm">Profile</Link>
            <Link to="/admin" className="text-sm">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/room/:id" element={<Room/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </main>
    </div>
  );
}

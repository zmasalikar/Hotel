import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Room from './pages/Room';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Confirmation from './pages/Confirmation';

function Nav(){
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Hotel Booking</Link>
        <nav className="space-x-4">
          <Link to="/search" className="text-sm">Search</Link>
          {user ? (
            <>
              <Link to="/profile" className="text-sm">Profile</Link>
              <button onClick={logout} className="text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register</Link>
            </>
          )}
          <Link to="/admin" className="text-sm">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

export default function App(){
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/room/:id" element={<Room/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/admin" element={<Admin/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
        </Routes>
      </main>
    </div>
  );
}

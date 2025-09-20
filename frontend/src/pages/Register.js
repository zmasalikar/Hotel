// frontend/src/pages/Register.js
import React, { useState } from 'react';
import getApi from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const api = getApi();
      await api.post('/api/auth/register', { name, email, password });
      // after register, go to login
      navigate('/login');
    } catch (error) {
      setErr(error?.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <form onSubmit={submit}>
        <input className="w-full border p-2 mb-3" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border p-2 mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 mb-3" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Register</button>
      </form>
    </div>
  );
}

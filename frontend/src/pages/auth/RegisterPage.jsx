import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/register', form);
      loginUser(data);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-10">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-xl p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-primary">New User</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create your EV account</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <input className="input md:col-span-2" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

        <button className="btn-primary mt-6 w-full">Register</button>
        <p className="mt-4 text-sm text-slate-400">
          Already registered? <Link className="text-primary" to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

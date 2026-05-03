import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/admin/login', form);
      loginAdmin(data);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-md p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-primary">Admin Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Operations control</h1>
        <p className="mt-2 text-sm text-slate-400">Use your configured admin credentials to access analytics and management tools.</p>

        <div className="mt-8 space-y-4">
          <input className="input" placeholder="Admin email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
        <button className="btn-primary mt-6 w-full">Login as Admin</button>
      </form>
    </div>
  );
}

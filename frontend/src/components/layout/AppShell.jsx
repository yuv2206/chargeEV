import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BatteryCharging, CreditCard, History, LayoutDashboard, LogOut, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const userLinks = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/stations', label: 'Stations', icon: MapPin },
  { to: '/app/bookings', label: 'Bookings', icon: History },
  { to: '/app/payments', label: 'Payments', icon: CreditCard },
];

export default function AppShell() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const logout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="glass-card w-full p-5 lg:w-72">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/15 p-3 text-primary">
              <BatteryCharging />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">EV Charge</p>
              <p className="text-xs text-slate-400">User Control Center</p>
            </div>
          </Link>

          <div className="mt-8 space-y-2">
            {userLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-primary text-slate-950' : 'text-slate-300 hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/admin/login"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800/70"
            >
              <Shield size={18} />
              Admin Panel
            </NavLink>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Signed in</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{user?.full_name}</h3>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>

          <button onClick={logout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-rose-500 hover:text-rose-300">
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

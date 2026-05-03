import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, BatteryCharging, ClipboardList, CreditCard, LogOut, MapPinned, ShieldCheck, Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/admin', label: 'Overview', icon: BarChart3 },
  { to: '/admin/stations', label: 'Stations', icon: MapPinned },
  { to: '/admin/chargers', label: 'Chargers', icon: BatteryCharging },
  { to: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
];

export default function AdminShell() {
  const navigate = useNavigate();
  const { logoutAdmin } = useAuth();

  const logout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="glass-card w-full p-5 lg:w-80">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/15 p-3 text-primary">
              <ShieldCheck />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Admin Console</p>
              <p className="text-xs text-slate-400">Station operations and analytics</p>
            </div>
          </Link>

          <div className="mt-8 space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
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

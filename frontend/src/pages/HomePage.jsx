import { ArrowRight, BatteryCharging, CalendarCheck, LineChart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: BatteryCharging, title: 'Station Visibility', text: 'Search EV stations, compare charger types, and check live availability.' },
  { icon: CalendarCheck, title: 'Smart Booking', text: 'Reserve charging slots with conflict-safe booking workflows and session tracking.' },
  { icon: LineChart, title: 'Auto Billing', text: 'Generate session bills from active tariff plans with payment-ready invoices.' },
  { icon: ShieldCheck, title: 'Admin Control', text: 'Manage stations, chargers, maintenance, and revenue analytics from one panel.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hero px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-card overflow-hidden p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-primary">DBMS Project</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
                EV Charging Station Management System
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-300">
                A premium full-stack platform for booking charging slots, managing live sessions, automating billing, and monitoring multi-station operations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                  User Login
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn-secondary">
                  Create Account
                </Link>
                <Link to="/admin/login" className="btn-secondary">
                  Admin Login
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-emerald-500/10 bg-slate-950/60 p-5">
                  <div className="inline-flex rounded-2xl bg-primary/15 p-3 text-primary">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}

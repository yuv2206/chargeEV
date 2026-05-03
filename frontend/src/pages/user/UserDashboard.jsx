import { useEffect, useState } from 'react';
import { BatteryCharging, CalendarRange, IndianRupee, MapPin } from 'lucide-react';
import api from '../../api/client';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { formatCurrency } from '../../lib/utils';

export default function UserDashboard() {
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/stations'), api.get('/bookings/mine')])
      .then(([stationsRes, bookingsRes]) => {
        setStations(stationsRes.data.stations);
        setBookings(bookingsRes.data.bookings);
      })
      .catch(() => {});
  }, []);

  const activeSessions = bookings.filter((item) => item.session_status === 'Charging').length;
  const totalSpend = bookings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Overview"
        title="Your charging dashboard"
        description="Track your reservations, live sessions, and payment progress from one place."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stations Available" value={stations.length} hint="Across seeded city network" icon={MapPin} />
        <StatCard label="My Bookings" value={bookings.length} hint="All reservations linked to your account" icon={CalendarRange} />
        <StatCard label="Live Sessions" value={activeSessions} hint="Sessions currently charging" icon={BatteryCharging} />
        <StatCard label="Total Payments" value={formatCurrency(totalSpend)} hint="Paid or generated bills" icon={IndianRupee} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white">Nearby stations snapshot</h3>
          <div className="mt-5 space-y-4">
            {stations.slice(0, 4).map((station) => (
              <div key={station.station_id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{station.station_name}</h4>
                    <p className="text-sm text-slate-400">{station.city} • {station.address}</p>
                  </div>
                  <div className="text-sm text-slate-300">
                    {station.available_chargers} / {station.charger_count} available
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white">Recent booking activity</h3>
          <div className="mt-5 space-y-4">
            {bookings.slice(0, 4).map((booking) => (
              <div key={booking.booking_id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm text-primary">{booking.station_name}</p>
                <h4 className="mt-2 text-lg font-semibold text-white">{booking.charger_type}</h4>
                <p className="mt-2 text-sm text-slate-400">{new Date(booking.slot_start).toLocaleString()}</p>
                <p className="mt-2 text-sm text-slate-300">Status: {booking.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

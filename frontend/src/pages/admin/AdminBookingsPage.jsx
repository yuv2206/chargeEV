import { useEffect, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime } from '../../lib/utils';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings', { headers: { 'X-Admin-Request': 'true' } }).then(({ data }) => setBookings(data.bookings));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Bookings" title="View bookings" description="Inspect all user bookings, session progress, and payment state." />
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Station</th>
                <th className="px-5 py-4">Slot</th>
                <th className="px-5 py-4">Booking</th>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id} className="border-t border-slate-800">
                  <td className="px-5 py-4 text-white">{booking.full_name}<div className="text-xs text-slate-500">{booking.email}</div></td>
                  <td className="px-5 py-4 text-slate-300">{booking.station_name}<div className="text-xs text-slate-500">{booking.charger_type}</div></td>
                  <td className="px-5 py-4 text-slate-300">{formatDateTime(booking.slot_start)}</td>
                  <td className="px-5 py-4"><StatusBadge value={booking.status} /></td>
                  <td className="px-5 py-4">{booking.session_status ? <StatusBadge value={booking.session_status} /> : 'N/A'}</td>
                  <td className="px-5 py-4">{booking.payment_status ? <StatusBadge value={booking.payment_status} /> : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


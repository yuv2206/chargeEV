import { useEffect, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const loadBookings = async () => {
    const { data } = await api.get('/bookings/mine');
    setBookings(data.bookings);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const startSession = async (bookingId) => {
    await api.post(`/sessions/start/${bookingId}`);
    setMessage('Session started successfully.');
    loadBookings();
  };

  const endSession = async (sessionId) => {
    const units = window.prompt('Enter units consumed in kWh');
    if (!units) return;

    const { data } = await api.post(`/sessions/end/${sessionId}`, { units_kwh: units });
    setMessage(`Session ended. Estimated bill: ${formatCurrency(data.bill.amount)}`);
    loadBookings();
  };

  const cancelBooking = async (bookingId) => {
    await api.patch(`/bookings/${bookingId}/cancel`);
    setMessage('Booking cancelled.');
    loadBookings();
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Bookings"
        title="Your reservation history"
        description="Start sessions, complete charging, and track generated bills for every booking."
      />

      {message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-primary">{message}</p> : null}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.booking_id} className="glass-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">{booking.station_name}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{booking.charger_type}</h3>
                <p className="mt-2 text-sm text-slate-400">{formatDateTime(booking.slot_start)} to {formatDateTime(booking.slot_end)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge value={booking.status} />
                  {booking.session_status ? <StatusBadge value={booking.session_status} /> : null}
                  {booking.payment_status ? <StatusBadge value={booking.payment_status} /> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {booking.status === 'Booked' ? <button className="btn-primary" onClick={() => startSession(booking.booking_id)}>Start Session</button> : null}
                {booking.session_status === 'Charging' ? <button className="btn-secondary" onClick={() => endSession(booking.session_id)}>End Session</button> : null}
                {booking.status === 'Booked' ? <button className="btn-secondary" onClick={() => cancelBooking(booking.booking_id)}>Cancel</button> : null}
              </div>
            </div>

            {booking.amount ? <p className="mt-4 text-sm text-slate-300">Generated bill: {formatCurrency(booking.amount)}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

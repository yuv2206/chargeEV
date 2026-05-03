import { useEffect, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../lib/utils';

export default function PaymentsPage() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const { data } = await api.get('/bookings/mine');
    setBookings(data.bookings.filter((item) => item.session_status === 'Completed'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const payNow = async (sessionId) => {
    const { data } = await api.post('/payments', {
      session_id: sessionId,
      payment_mode: 'UPI',
    });

    setMessage(`Payment successful for amount ${formatCurrency(data.payment.amount)}`);
    loadData();
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Payments"
        title="Complete pending bills"
        description="Payments are generated from the active tariff plan after charging sessions are completed."
      />

      {message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-primary">{message}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <div key={booking.booking_id} className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-primary">{booking.station_name}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{booking.charger_type}</h3>
            <p className="mt-3 text-sm text-slate-400">Session ID: {booking.session_id}</p>
            <div className="mt-4 flex items-center gap-3">
              {booking.payment_status ? <StatusBadge value={booking.payment_status} /> : <StatusBadge value="Pending" />}
            </div>
            <p className="mt-5 text-3xl font-bold text-white">{formatCurrency(booking.amount || 0)}</p>
            <button className="btn-primary mt-6 w-full" onClick={() => payNow(booking.session_id)}>
              Pay via UPI
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

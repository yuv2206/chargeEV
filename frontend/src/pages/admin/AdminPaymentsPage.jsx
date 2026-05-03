import { useEffect, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/payments', { headers: { 'X-Admin-Request': 'true' } }).then(({ data }) => setPayments(data.payments));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Payments" title="View payments" description="Track completed billing and payment records across the platform." />
      <div className="grid gap-4 md:grid-cols-2">
        {payments.map((payment) => (
          <div key={payment.payment_id} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">{payment.station_name}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{payment.full_name}</h3>
              </div>
              <StatusBadge value={payment.payment_status} />
            </div>
            <p className="mt-4 text-sm text-slate-400">Payment mode: {payment.payment_mode}</p>
            <p className="mt-2 text-sm text-slate-400">Units: {payment.units_kwh} kWh</p>
            <p className="mt-2 text-sm text-slate-400">Time: {formatDateTime(payment.payment_time)}</p>
            <p className="mt-5 text-3xl font-bold text-white">{formatCurrency(payment.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


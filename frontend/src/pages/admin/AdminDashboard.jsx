import { useEffect, useState } from 'react';
import { Activity, BatteryCharging, Building2, IndianRupee, Ticket } from 'lucide-react';
import api from '../../api/client';
import BookingRevenueChart from '../../components/charts/BookingRevenueChart';
import StatusPieChart from '../../components/charts/StatusPieChart';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { formatCurrency } from '../../lib/utils';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api
      .get('/admin/dashboard', { headers: { 'X-Admin-Request': 'true' } })
      .then(({ data }) => setAnalytics(data))
      .catch(() => {});
  }, []);

  if (!analytics) {
    return <div className="glass-card p-8 text-slate-300">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Analytics"
        title="Operations dashboard"
        description="Monitor station network health, booking throughput, and revenue generation."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Stations" value={analytics.overview.total_stations} icon={Building2} />
        <StatCard label="Chargers" value={analytics.overview.total_chargers} icon={BatteryCharging} />
        <StatCard label="Bookings" value={analytics.overview.total_bookings} icon={Ticket} />
        <StatCard label="Paid Txns" value={analytics.overview.paid_transactions} icon={Activity} />
        <StatCard label="Revenue" value={formatCurrency(analytics.overview.total_revenue)} icon={IndianRupee} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BookingRevenueChart title="Bookings Trend" data={analytics.bookingTrend} dataKey="bookings" stroke="#3ddc84" fill="#3ddc84" />
        <BookingRevenueChart title="Revenue Trend" data={analytics.revenueTrend} dataKey="revenue" stroke="#38bdf8" fill="#38bdf8" />
      </div>

      <StatusPieChart data={analytics.chargerStatus} />
    </div>
  );
}


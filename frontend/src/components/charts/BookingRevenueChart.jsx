import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function BookingRevenueChart({ title, data, dataKey, stroke, fill }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`${dataKey}-gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.4} />
                <stop offset="95%" stopColor={fill} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
            <Area type="monotone" dataKey={dataKey} stroke={stroke} fillOpacity={1} fill={`url(#${dataKey}-gradient)`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


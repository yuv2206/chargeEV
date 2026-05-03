import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const colors = ['#3ddc84', '#38bdf8', '#f59e0b', '#f97316', '#94a3b8'];

export default function StatusPieChart({ data }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-semibold text-white">Charger Status Distribution</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry, index) => (
                <Cell key={entry.status} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-primary">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

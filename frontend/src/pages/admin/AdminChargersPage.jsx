import { useEffect, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';

const initialForm = { station_id: '', charger_type: '', power_kw: '', status: 'Available' };

export default function AdminChargersPage() {
  const [chargers, setChargers] = useState([]);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    const [chargerRes, stationRes] = await Promise.all([
      api.get('/chargers', { headers: { 'X-Admin-Request': 'true' } }),
      api.get('/stations', { headers: { 'X-Admin-Request': 'true' } }),
    ]);
    setChargers(chargerRes.data.chargers);
    setStations(stationRes.data.stations);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitForm = async (event) => {
    event.preventDefault();
    const payload = { ...form, power_kw: Number(form.power_kw) };
    if (editingId) {
      await api.put(`/chargers/${editingId}`, payload, { headers: { 'X-Admin-Request': 'true' } });
    } else {
      await api.post('/chargers', payload, { headers: { 'X-Admin-Request': 'true' } });
    }
    setForm(initialForm);
    setEditingId(null);
    loadData();
  };

  const removeCharger = async (id) => {
    await api.delete(`/chargers/${id}`, { headers: { 'X-Admin-Request': 'true' } });
    loadData();
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Chargers" title="Manage chargers" description="Keep charger inventory and status aligned with station operations." />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submitForm} className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit charger' : 'Add charger'}</h3>
          <div className="mt-5 space-y-4">
            <select className="input" value={form.station_id} onChange={(e) => setForm({ ...form, station_id: e.target.value })}>
              <option value="">Select station</option>
              {stations.map((station) => <option key={station.station_id} value={station.station_id}>{station.station_name}</option>)}
            </select>
            <input className="input" placeholder="Charger type" value={form.charger_type} onChange={(e) => setForm({ ...form, charger_type: e.target.value })} />
            <input className="input" placeholder="Power (kW)" type="number" value={form.power_kw} onChange={(e) => setForm({ ...form, power_kw: e.target.value })} />
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Available</option>
              <option>Booked</option>
              <option>Charging</option>
              <option>Maintenance</option>
            </select>
            <button className="btn-primary w-full">{editingId ? 'Update Charger' : 'Create Charger'}</button>
          </div>
        </form>

        <div className="space-y-4">
          {chargers.map((charger) => (
            <div key={charger.charger_id} className="glass-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{charger.charger_type}</h3>
                  <p className="mt-2 text-sm text-slate-400">{charger.station_name} • {charger.city}</p>
                  <p className="mt-2 text-sm text-slate-300">{charger.power_kw} kW</p>
                  <div className="mt-3"><StatusBadge value={charger.status} /></div>
                </div>
                <div className="flex gap-3">
                  <button className="btn-secondary" onClick={() => { setEditingId(charger.charger_id); setForm(charger); }}>Edit</button>
                  <button className="btn-secondary" onClick={() => removeCharger(charger.charger_id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


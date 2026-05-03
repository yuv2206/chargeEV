import { useEffect, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';

const initialForm = { station_name: '', city: '', address: '', status: 'Available' };

export default function AdminStationsPage() {
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    const { data } = await api.get('/stations', { headers: { 'X-Admin-Request': 'true' } });
    setStations(data.stations);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitForm = async (event) => {
    event.preventDefault();
    if (editingId) {
      await api.put(`/stations/${editingId}`, form, { headers: { 'X-Admin-Request': 'true' } });
    } else {
      await api.post('/stations', form, { headers: { 'X-Admin-Request': 'true' } });
    }
    setForm(initialForm);
    setEditingId(null);
    loadData();
  };

  const removeStation = async (id) => {
    await api.delete(`/stations/${id}`, { headers: { 'X-Admin-Request': 'true' } });
    loadData();
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Stations" title="Manage stations" description="Create, update, and remove charging stations from the network." />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submitForm} className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit station' : 'Add station'}</h3>
          <div className="mt-5 space-y-4">
            <input className="input" placeholder="Station name" value={form.station_name} onChange={(e) => setForm({ ...form, station_name: e.target.value })} />
            <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <textarea className="input min-h-28" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Available</option>
              <option>Inactive</option>
              <option>Maintenance</option>
            </select>
            <button className="btn-primary w-full">{editingId ? 'Update Station' : 'Create Station'}</button>
          </div>
        </form>

        <div className="space-y-4">
          {stations.map((station) => (
            <div key={station.station_id} className="glass-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{station.station_name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{station.city} • {station.address}</p>
                  <div className="mt-3"><StatusBadge value={station.status} /></div>
                </div>
                <div className="flex gap-3">
                  <button className="btn-secondary" onClick={() => { setEditingId(station.station_id); setForm(station); }}>Edit</button>
                  <button className="btn-secondary" onClick={() => removeStation(station.station_id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime } from '../../lib/utils';

const initialForm = { charger_id: '', issue_type: '', reported_on: '', resolved_on: '', remarks: '' };

export default function AdminMaintenancePage() {
  const [logs, setLogs] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    const [logsRes, chargersRes] = await Promise.all([
      api.get('/maintenance', { headers: { 'X-Admin-Request': 'true' } }),
      api.get('/chargers', { headers: { 'X-Admin-Request': 'true' } }),
    ]);
    setLogs(logsRes.data.logs);
    setChargers(chargersRes.data.chargers);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitForm = async (event) => {
    event.preventDefault();
    if (editingId) {
      await api.put(`/maintenance/${editingId}`, form, { headers: { 'X-Admin-Request': 'true' } });
    } else {
      await api.post('/maintenance', form, { headers: { 'X-Admin-Request': 'true' } });
    }
    setForm(initialForm);
    setEditingId(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Maintenance" title="Maintenance logs" description="Record reported issues and release chargers back into service after resolution." />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submitForm} className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit log' : 'Add maintenance log'}</h3>
          <div className="mt-5 space-y-4">
            <select className="input" value={form.charger_id} onChange={(e) => setForm({ ...form, charger_id: e.target.value })}>
              <option value="">Select charger</option>
              {chargers.map((charger) => <option key={charger.charger_id} value={charger.charger_id}>{charger.charger_type} - {charger.station_name}</option>)}
            </select>
            <input className="input" placeholder="Issue type" value={form.issue_type} onChange={(e) => setForm({ ...form, issue_type: e.target.value })} />
            <input className="input" type="datetime-local" value={form.reported_on} onChange={(e) => setForm({ ...form, reported_on: e.target.value })} />
            <input className="input" type="datetime-local" value={form.resolved_on} onChange={(e) => setForm({ ...form, resolved_on: e.target.value })} />
            <textarea className="input min-h-28" placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            <button className="btn-primary w-full">{editingId ? 'Update Log' : 'Create Log'}</button>
          </div>
        </form>

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.log_id} className="glass-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{log.issue_type}</h3>
                  <p className="mt-2 text-sm text-slate-400">{log.station_name} • {log.charger_type}</p>
                  <p className="mt-2 text-sm text-slate-500">Reported: {formatDateTime(log.reported_on)}</p>
                  <p className="mt-2 text-sm text-slate-500">Resolved: {formatDateTime(log.resolved_on)}</p>
                  <p className="mt-3 text-sm text-slate-300">{log.remarks}</p>
                </div>
                <div className="space-y-3">
                  <StatusBadge value={log.resolved_on ? 'Available' : 'Maintenance'} />
                  <button className="btn-secondary" onClick={() => { setEditingId(log.log_id); setForm({ ...log, reported_on: log.reported_on?.slice(0, 16) || '', resolved_on: log.resolved_on?.slice(0, 16) || '' }); }}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


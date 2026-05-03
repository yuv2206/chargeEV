import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';

export default function StationsPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [slotForm, setSlotForm] = useState({ charger_id: '', booking_date: '', slot_start: '', slot_end: '' });
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  const loadStations = async () => {
    const { data } = await api.get('/stations', { params: search ? { search } : {} });
    setStations(data.stations);
  };

  useEffect(() => {
    loadStations();
  }, []);

  const openStation = async (stationId) => {
    const { data } = await api.get(`/stations/${stationId}`);
    setSelectedStation(data);
    setSlotForm((prev) => ({ ...prev, charger_id: '' }));
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    setFeedback('');

    try {
      await api.post('/bookings', slotForm);
      setFeedback('Booking created successfully.');
      await loadStations();
      if (selectedStation?.station?.station_id) {
        await openStation(selectedStation.station.station_id);
      }
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not create booking.');
    }
  };

  const stationCards = useMemo(() => stations, [stations]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Stations"
        title="Search charging stations"
        description="Browse stations, inspect chargers at each location, and reserve a charging slot."
        action={
          <div className="flex w-full max-w-sm gap-3">
            <input className="input" placeholder="Search station or address" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn-secondary" onClick={loadStations}>Search</button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {stationCards.map((station) => (
            <button
              key={station.station_id}
              onClick={() => openStation(station.station_id)}
              className="glass-card w-full p-5 text-left transition hover:border-emerald-500/30"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{station.station_name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{station.city} • {station.address}</p>
                </div>
                <div className="text-right">
                  <StatusBadge value={station.status} />
                  <p className="mt-3 text-sm text-slate-300">{station.available_chargers} chargers available</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-2xl font-semibold text-white">
            {selectedStation ? selectedStation.station.station_name : 'Select a station'}
          </h3>

          {selectedStation ? (
            <>
              <div className="mt-6 space-y-3">
                {selectedStation.chargers.map((charger) => (
                  <label key={charger.charger_id} className="flex cursor-pointer items-center justify-between rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{charger.charger_type}</p>
                      <p className="text-sm text-slate-400">{charger.power_kw} kW</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge value={charger.status} />
                      <input
                        type="radio"
                        name="charger"
                        checked={String(slotForm.charger_id) === String(charger.charger_id)}
                        onChange={() => setSlotForm({ ...slotForm, charger_id: charger.charger_id })}
                        disabled={charger.status === 'Maintenance'}
                      />
                    </div>
                  </label>
                ))}
              </div>

              <form onSubmit={handleBooking} className="mt-6 grid gap-4 md:grid-cols-2">
                <input className="input" type="date" value={slotForm.booking_date} onChange={(e) => setSlotForm({ ...slotForm, booking_date: e.target.value })} />
                <input className="input" type="datetime-local" value={slotForm.slot_start} onChange={(e) => setSlotForm({ ...slotForm, slot_start: e.target.value })} />
                <input className="input md:col-span-2" type="datetime-local" value={slotForm.slot_end} onChange={(e) => setSlotForm({ ...slotForm, slot_end: e.target.value })} />
                <button className="btn-primary md:col-span-2">Book Selected Charger</button>
              </form>

              {feedback ? <p className="mt-4 text-sm text-primary">{feedback}</p> : null}
            </>
          ) : (
            <p className="mt-4 text-slate-400">Click a station card to inspect chargers and create a booking.</p>
          )}
        </div>
      </div>
    </div>
  );
}

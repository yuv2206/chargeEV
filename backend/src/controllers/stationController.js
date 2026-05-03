import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const getStations = asyncHandler(async (req, res) => {
  const { city, status, search } = req.query;
  const conditions = [];
  const values = [];

  if (city) {
    values.push(city);
    conditions.push(`LOWER(city) = LOWER($${values.length})`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(station_name ILIKE $${values.length} OR address ILIKE $${values.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT s.*,
      COUNT(c.charger_id) AS charger_count,
      COUNT(c.charger_id) FILTER (WHERE c.status = 'Available') AS available_chargers
     FROM Station s
     LEFT JOIN Charger c ON c.station_id = s.station_id
     ${whereClause}
     GROUP BY s.station_id
     ORDER BY s.station_id`,
    values
  );

  res.json({ success: true, stations: result.rows });
});

export const getStationById = asyncHandler(async (req, res) => {
  const station = await query('SELECT * FROM Station WHERE station_id = $1', [req.params.id]);
  const chargers = await query('SELECT * FROM Charger WHERE station_id = $1 ORDER BY charger_id', [req.params.id]);

  if (!station.rows.length) {
    throw new AppError('Station not found', 404);
  }

  res.json({
    success: true,
    station: station.rows[0],
    chargers: chargers.rows,
  });
});

export const createStation = asyncHandler(async (req, res) => {
  const { station_name, city, address, status } = req.body;
  const result = await query(
    `INSERT INTO Station (station_name, city, address, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [station_name, city, address, status || 'Available']
  );
  res.status(201).json({ success: true, station: result.rows[0] });
});

export const updateStation = asyncHandler(async (req, res) => {
  const { station_name, city, address, status } = req.body;
  const result = await query(
    `UPDATE Station
     SET station_name = $1, city = $2, address = $3, status = $4
     WHERE station_id = $5
     RETURNING *`,
    [station_name, city, address, status, req.params.id]
  );

  if (!result.rows.length) {
    throw new AppError('Station not found', 404);
  }

  res.json({ success: true, station: result.rows[0] });
});

export const deleteStation = asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM Station WHERE station_id = $1 RETURNING station_id', [req.params.id]);

  if (!result.rows.length) {
    throw new AppError('Station not found', 404);
  }

  res.json({ success: true, message: 'Station deleted successfully' });
});

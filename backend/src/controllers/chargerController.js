import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const getChargers = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.*, s.station_name, s.city
     FROM Charger c
     JOIN Station s ON s.station_id = c.station_id
     ORDER BY c.charger_id`
  );
  res.json({ success: true, chargers: result.rows });
});

export const createCharger = asyncHandler(async (req, res) => {
  const { station_id, charger_type, power_kw, status } = req.body;
  const result = await query(
    `INSERT INTO Charger (station_id, charger_type, power_kw, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [station_id, charger_type, power_kw, status || 'Available']
  );
  res.status(201).json({ success: true, charger: result.rows[0] });
});

export const updateCharger = asyncHandler(async (req, res) => {
  const { station_id, charger_type, power_kw, status } = req.body;
  const result = await query(
    `UPDATE Charger
     SET station_id = $1, charger_type = $2, power_kw = $3, status = $4
     WHERE charger_id = $5
     RETURNING *`,
    [station_id, charger_type, power_kw, status, req.params.id]
  );

  if (!result.rows.length) {
    throw new AppError('Charger not found', 404);
  }

  res.json({ success: true, charger: result.rows[0] });
});

export const deleteCharger = asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM Charger WHERE charger_id = $1 RETURNING charger_id', [req.params.id]);

  if (!result.rows.length) {
    throw new AppError('Charger not found', 404);
  }

  res.json({ success: true, message: 'Charger deleted successfully' });
});


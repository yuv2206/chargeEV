import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const getMaintenanceLogs = asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT ml.*, c.charger_type, s.station_name
     FROM Maintenance_Log ml
     JOIN Charger c ON c.charger_id = ml.charger_id
     JOIN Station s ON s.station_id = c.station_id
     ORDER BY ml.log_id DESC`
  );

  res.json({ success: true, logs: result.rows });
});

export const createMaintenanceLog = asyncHandler(async (req, res) => {
  const { charger_id, issue_type, reported_on, resolved_on, remarks } = req.body;
  const result = await query(
    `INSERT INTO Maintenance_Log (charger_id, issue_type, reported_on, resolved_on, remarks)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [charger_id, issue_type, reported_on || new Date(), resolved_on || null, remarks || null]
  );

  await query(`UPDATE Charger SET status = 'Maintenance' WHERE charger_id = $1`, [charger_id]);

  res.status(201).json({ success: true, log: result.rows[0] });
});

export const updateMaintenanceLog = asyncHandler(async (req, res) => {
  const { charger_id, issue_type, reported_on, resolved_on, remarks } = req.body;
  const result = await query(
    `UPDATE Maintenance_Log
     SET charger_id = $1, issue_type = $2, reported_on = $3, resolved_on = $4, remarks = $5
     WHERE log_id = $6
     RETURNING *`,
    [charger_id, issue_type, reported_on, resolved_on, remarks, req.params.id]
  );

  if (!result.rows.length) {
    throw new AppError('Maintenance log not found', 404);
  }

  await query(`UPDATE Charger SET status = $1 WHERE charger_id = $2`, [resolved_on ? 'Available' : 'Maintenance', charger_id]);

  res.json({ success: true, log: result.rows[0] });
});


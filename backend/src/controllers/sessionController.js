import { pool, query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const startSession = asyncHandler(async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      `SELECT b.*, cs.session_id, cs.session_status
       FROM Booking b
       JOIN Charging_Session cs ON cs.booking_id = b.booking_id
       WHERE b.booking_id = $1 AND b.user_id = $2
       FOR UPDATE`,
      [req.params.bookingId, req.user.user_id]
    );

    if (!bookingResult.rows.length) {
      throw new AppError('Booking not found', 404);
    }

    const booking = bookingResult.rows[0];

    if (booking.status === 'Cancelled') {
      throw new AppError('Cancelled bookings cannot start sessions', 400);
    }

    if (booking.session_status === 'Charging') {
      throw new AppError('Session already started', 400);
    }

    await client.query(
      `UPDATE Charging_Session
       SET start_time = CURRENT_TIMESTAMP, session_status = 'Charging'
       WHERE session_id = $1`,
      [booking.session_id]
    );

    await client.query(`UPDATE Booking SET status = 'Charging' WHERE booking_id = $1`, [booking.booking_id]);
    await client.query(`UPDATE Charger SET status = 'Charging' WHERE charger_id = $1`, [booking.charger_id]);

    await client.query('COMMIT');

    res.json({ success: true, message: 'Charging session started', session_id: booking.session_id });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const endSession = asyncHandler(async (req, res) => {
  const { units_kwh } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(
      `SELECT cs.*, b.booking_id, b.charger_id, b.user_id
       FROM Charging_Session cs
       JOIN Booking b ON b.booking_id = cs.booking_id
       WHERE cs.session_id = $1
       FOR UPDATE`,
      [req.params.sessionId]
    );

    if (!sessionResult.rows.length) {
      throw new AppError('Session not found', 404);
    }

    const session = sessionResult.rows[0];

    if (session.user_id !== req.user.user_id) {
      throw new AppError('You are not allowed to close this session', 403);
    }

    if (session.session_status !== 'Charging') {
      throw new AppError('Only active charging sessions can be closed', 400);
    }

    await client.query(
      `UPDATE Charging_Session
       SET end_time = CURRENT_TIMESTAMP, units_kwh = $1, session_status = 'Completed'
       WHERE session_id = $2`,
      [units_kwh, req.params.sessionId]
    );

    await client.query(`UPDATE Booking SET status = 'Completed' WHERE booking_id = $1`, [session.booking_id]);
    await client.query(`UPDATE Charger SET status = 'Available' WHERE charger_id = $1`, [session.charger_id]);

    const billResult = await client.query('SELECT * FROM calculate_payable_amount($1)', [units_kwh]);

    if (!billResult.rows.length) {
      throw new AppError('No active tariff plan available', 400);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Charging session ended',
      bill: billResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const getBill = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT cs.session_id, cs.units_kwh, cs.session_status, p.payment_status, p.amount, tp.rate_per_kwh, tp.service_fee
     FROM Charging_Session cs
     LEFT JOIN Payment p ON p.session_id = cs.session_id
     LEFT JOIN Tariff_Plan tp ON tp.tariff_id = p.tariff_id
     WHERE cs.session_id = $1`,
    [req.params.sessionId]
  );

  if (!result.rows.length) {
    throw new AppError('Session not found', 404);
  }

  const row = result.rows[0];
  if (!row.amount) {
    const billPreview = await query('SELECT * FROM calculate_payable_amount($1)', [row.units_kwh || 0]);
    row.amount = billPreview.rows[0]?.amount || 0;
    row.rate_per_kwh = billPreview.rows[0]?.rate_per_kwh || 0;
    row.service_fee = billPreview.rows[0]?.service_fee || 0;
  }

  res.json({ success: true, bill: row });
});

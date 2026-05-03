import { pool } from '../config/db.js';
import { AppError } from '../utils/appError.js';

export const createBookingWithSession = async ({ userId, chargerId, bookingDate, slotStart, slotEnd }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const chargerResult = await client.query(
      'SELECT charger_id, status FROM Charger WHERE charger_id = $1 FOR UPDATE',
      [chargerId]
    );

    if (!chargerResult.rows.length) {
      throw new AppError('Charger not found', 404);
    }

    const charger = chargerResult.rows[0];

    if (charger.status === 'Maintenance') {
      throw new AppError('Charger is under maintenance', 400);
    }

    const bookingResult = await client.query(
      `INSERT INTO Booking (user_id, charger_id, booking_date, slot_start, slot_end, status)
       VALUES ($1, $2, $3, $4, $5, 'Booked')
       RETURNING *`,
      [userId, chargerId, bookingDate, slotStart, slotEnd]
    );

    const booking = bookingResult.rows[0];

    await client.query(
      `INSERT INTO Charging_Session (booking_id, start_time, end_time, units_kwh, session_status)
       VALUES ($1, NULL, NULL, 0, 'Pending')`,
      [booking.booking_id]
    );

    await client.query(`UPDATE Charger SET status = 'Booked' WHERE charger_id = $1`, [chargerId]);

    await client.query('COMMIT');

    return booking;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const processPaymentTransaction = async ({ sessionId, paymentMode }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(
      `SELECT cs.session_id, cs.units_kwh, cs.session_status, p.payment_id
       FROM Charging_Session cs
       LEFT JOIN Payment p ON p.session_id = cs.session_id
       WHERE cs.session_id = $1
       FOR UPDATE`,
      [sessionId]
    );

    if (!sessionResult.rows.length) {
      throw new AppError('Session not found', 404);
    }

    const session = sessionResult.rows[0];

    if (session.session_status !== 'Completed') {
      throw new AppError('Complete the session before payment', 400);
    }

    const amountResult = await client.query('SELECT * FROM calculate_payable_amount($1)', [session.units_kwh]);

    if (!amountResult.rows.length) {
      throw new AppError('No active tariff plan found', 400);
    }

    const tariff = amountResult.rows[0];

    const paymentResult = await client.query(
      `INSERT INTO Payment (session_id, tariff_id, amount, payment_mode, payment_status, payment_time)
       VALUES ($1, $2, $3, $4, 'Paid', CURRENT_TIMESTAMP)
       ON CONFLICT (session_id)
       DO UPDATE SET
         tariff_id = EXCLUDED.tariff_id,
         amount = EXCLUDED.amount,
         payment_mode = EXCLUDED.payment_mode,
         payment_status = 'Paid',
         payment_time = CURRENT_TIMESTAMP
       RETURNING *`,
      [sessionId, tariff.tariff_id, tariff.amount, paymentMode]
    );

    await client.query('COMMIT');
    return paymentResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


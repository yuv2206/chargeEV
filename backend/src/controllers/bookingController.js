import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { createBookingWithSession } from '../services/bookingService.js';

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await createBookingWithSession({
    userId: req.user.user_id,
    chargerId: req.body.charger_id,
    bookingDate: req.body.booking_date,
    slotStart: req.body.slot_start,
    slotEnd: req.body.slot_end,
  });

  res.status(201).json({ success: true, booking });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT b.*, c.charger_type, c.power_kw, s.station_name, s.city, cs.session_id, cs.session_status,
            COALESCE(p.amount, tariff_preview.amount, 0) AS amount, p.payment_status
     FROM Booking b
     JOIN Charger c ON c.charger_id = b.charger_id
     JOIN Station s ON s.station_id = c.station_id
     LEFT JOIN Charging_Session cs ON cs.booking_id = b.booking_id
     LEFT JOIN Payment p ON p.session_id = cs.session_id
     LEFT JOIN LATERAL (
       SELECT amount
       FROM calculate_payable_amount(COALESCE(cs.units_kwh, 0))
     ) AS tariff_preview ON TRUE
     WHERE b.user_id = $1
     ORDER BY b.slot_start DESC`,
    [req.user.user_id]
  );

  res.json({ success: true, bookings: result.rows });
});

export const getAllBookings = asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT b.*, u.full_name, u.email, c.charger_type, s.station_name, cs.session_status, p.payment_status
     FROM Booking b
     JOIN User_Account u ON u.user_id = b.user_id
     JOIN Charger c ON c.charger_id = b.charger_id
     JOIN Station s ON s.station_id = c.station_id
     LEFT JOIN Charging_Session cs ON cs.booking_id = b.booking_id
     LEFT JOIN Payment p ON p.session_id = cs.session_id
     ORDER BY b.booking_id DESC`
  );

  res.json({ success: true, bookings: result.rows });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const bookingCheck = await query('SELECT * FROM Booking WHERE booking_id = $1 AND user_id = $2', [
    req.params.id,
    req.user.user_id,
  ]);

  if (!bookingCheck.rows.length) {
    throw new AppError('Booking not found', 404);
  }

  const booking = bookingCheck.rows[0];
  await query(`UPDATE Booking SET status = 'Cancelled' WHERE booking_id = $1`, [req.params.id]);
  await query(`UPDATE Charger SET status = 'Available' WHERE charger_id = $1`, [booking.charger_id]);

  res.json({ success: true, message: 'Booking cancelled successfully' });
});

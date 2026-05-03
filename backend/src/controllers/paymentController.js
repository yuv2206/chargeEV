import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { processPaymentTransaction } from '../services/bookingService.js';

export const makePayment = asyncHandler(async (req, res) => {
  const payment = await processPaymentTransaction({
    sessionId: req.body.session_id,
    paymentMode: req.body.payment_mode,
  });

  res.json({ success: true, payment });
});

export const getPayments = asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT p.*, cs.units_kwh, u.full_name, s.station_name
     FROM Payment p
     JOIN Charging_Session cs ON cs.session_id = p.session_id
     JOIN Booking b ON b.booking_id = cs.booking_id
     JOIN User_Account u ON u.user_id = b.user_id
     JOIN Charger c ON c.charger_id = b.charger_id
     JOIN Station s ON s.station_id = c.station_id
     ORDER BY p.payment_id DESC`
  );
  res.json({ success: true, payments: result.rows });
});


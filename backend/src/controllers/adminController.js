import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardAnalytics = asyncHandler(async (_req, res) => {
  const overview = await query(
    `SELECT
      (SELECT COUNT(*) FROM Station) AS total_stations,
      (SELECT COUNT(*) FROM Charger) AS total_chargers,
      (SELECT COUNT(*) FROM Booking) AS total_bookings,
      (SELECT COUNT(*) FROM Payment WHERE payment_status = 'Paid') AS paid_transactions,
      (SELECT COALESCE(SUM(amount), 0) FROM Payment WHERE payment_status = 'Paid') AS total_revenue`
  );

  const bookingTrend = await query(
    `SELECT TO_CHAR(DATE_TRUNC('day', slot_start), 'DD Mon') AS label, COUNT(*)::INT AS bookings
     FROM Booking
     WHERE slot_start >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY DATE_TRUNC('day', slot_start)
     ORDER BY DATE_TRUNC('day', slot_start)`
  );

  const revenueTrend = await query(
    `SELECT TO_CHAR(DATE_TRUNC('day', payment_time), 'DD Mon') AS label, COALESCE(SUM(amount), 0)::NUMERIC AS revenue
     FROM Payment
     WHERE payment_status = 'Paid'
       AND payment_time >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY DATE_TRUNC('day', payment_time)
     ORDER BY DATE_TRUNC('day', payment_time)`
  );

  const chargerStatus = await query(
    `SELECT status, COUNT(*)::INT AS total
     FROM Charger
     GROUP BY status
     ORDER BY status`
  );

  res.json({
    success: true,
    overview: overview.rows[0],
    bookingTrend: bookingTrend.rows,
    revenueTrend: revenueTrend.rows,
    chargerStatus: chargerStatus.rows,
  });
});


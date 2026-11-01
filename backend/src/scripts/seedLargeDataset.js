import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import '../config/env.js';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ChargeEV Dataset Generator
 * Generates 200+ realistic operational bookings, charging sessions, and payment records.
 * Can be written directly to `backend/sql/seed.sql` or inserted directly into PostgreSQL.
 */
export async function generateSeedSql() {
  const chargers = 8;
  const users = 6;
  const totalTarget = 205;

  let sql = `-- ============================================================================
-- ChargeEV: Operational Seed Dataset (205 Bookings, Sessions, and Transactions)
-- ============================================================================

-- Stations
INSERT INTO Station (station_id, station_name, city, address, status) VALUES
(1, 'VoltHub Central', 'Patiala', 'Rajpura Road, Near University, Patiala', 'Available'),
(2, 'GreenSpark Plaza', 'Chandigarh', 'Sector 34 Market, City Centre, Chandigarh', 'Available'),
(3, 'EcoCharge Point', 'Ludhiana', 'Ferozepur Road, Ludhiana', 'Available'),
(4, 'AeroCity FastHub', 'Delhi NCR', 'Near T3 IGI Airport, New Delhi', 'Available'),
(5, 'MetroCharge Station', 'Bengaluru', 'Outer Ring Road, Bellandur, Bengaluru', 'Available')
ON CONFLICT (station_id) DO NOTHING;

SELECT setval('station_station_id_seq', (SELECT COALESCE(MAX(station_id), 1) FROM Station));

-- Chargers
INSERT INTO Charger (charger_id, station_id, charger_type, power_kw, status) VALUES
(1, 1, 'DC Fast', 60.00, 'Available'),
(2, 1, 'AC Type-2', 22.00, 'Available'),
(3, 2, 'DC Fast', 120.00, 'Available'),
(4, 2, 'CCS2', 80.00, 'Available'),
(5, 3, 'AC Type-2', 30.00, 'Available'),
(6, 4, 'CCS2 Fast', 150.00, 'Available'),
(7, 4, 'CHAdeMO', 50.00, 'Available'),
(8, 5, 'DC Fast Dual', 120.00, 'Available')
ON CONFLICT (charger_id) DO NOTHING;

SELECT setval('charger_charger_id_seq', (SELECT COALESCE(MAX(charger_id), 1) FROM Charger));

-- User Accounts
INSERT INTO User_Account (user_id, full_name, phone, email, password) VALUES
(1, 'Aarav Sharma', '9876500011', 'aarav@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza'),
(2, 'Diya Verma', '9876500012', 'diya@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza'),
(3, 'Rohan Gupta', '9876500013', 'rohan@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza'),
(4, 'Priya Nair', '9876500014', 'priya@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza'),
(5, 'Vikram Singh', '9876500015', 'vikram@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza'),
(6, 'Ananya Iyer', '9876500016', 'ananya@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza')
ON CONFLICT (user_id) DO NOTHING;

SELECT setval('user_account_user_id_seq', (SELECT COALESCE(MAX(user_id), 1) FROM User_Account));

-- Tariff Plans
INSERT INTO Tariff_Plan (tariff_id, rate_per_kwh, service_fee, effective_from, active_flag) VALUES
(1, 18.50, 49.00, CURRENT_TIMESTAMP - INTERVAL '60 days', FALSE),
(2, 20.00, 59.00, CURRENT_TIMESTAMP - INTERVAL '30 days', TRUE)
ON CONFLICT (tariff_id) DO NOTHING;

SELECT setval('tariff_plan_tariff_id_seq', (SELECT COALESCE(MAX(tariff_id), 1) FROM Tariff_Plan));

-- Maintenance Logs
INSERT INTO Maintenance_Log (charger_id, issue_type, reported_on, resolved_on, remarks) VALUES
(5, 'Cable inspection', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '14 days', 'Replaced connector cap'),
(2, 'Display calibration', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days', 'Recalibrated touch screen');

-- ----------------------------------------------------------------------------
-- Historical Bookings, Charging Sessions & Payment Transactions
-- ----------------------------------------------------------------------------
`;

  const bookingInserts = [];
  const sessionInserts = [];
  const paymentInserts = [];

  let count = 0;
  const modes = ['UPI', 'Credit Card', 'Net Banking', 'Debit Card'];

  for (let dayOffset = 25; dayOffset >= 1 && count < totalTarget; dayOffset--) {
    for (let hour = 8; hour <= 20 && count < totalTarget; hour += 2) {
      for (let c = 1; c <= chargers && count < totalTarget; c++) {
        count++;
        const u = ((count - 1) % users) + 1;
        const kwh = (18 + ((count * 7) % 35)).toFixed(2);
        const amt = (Number(kwh) * 20 + 59).toFixed(2);
        const mode = modes[count % modes.length];

        const slotStart = `CURRENT_DATE - INTERVAL '${dayOffset} days' + INTERVAL '${hour} hours'`;
        const slotEnd = `CURRENT_DATE - INTERVAL '${dayOffset} days' + INTERVAL '${hour} hours 45 minutes'`;
        const bookingDate = `CURRENT_DATE - INTERVAL '${dayOffset} days'`;

        bookingInserts.push(`(${count}, ${u}, ${c}, ${bookingDate}, ${slotStart}, ${slotEnd}, 'Completed')`);
        sessionInserts.push(`(${count}, ${count}, ${slotStart}, ${slotEnd}, ${kwh}, 'Completed')`);
        paymentInserts.push(`(${count}, ${count}, 2, ${amt}, '${mode}', 'Paid', ${slotEnd})`);
      }
    }
  }

  sql += `
INSERT INTO Booking (booking_id, user_id, charger_id, booking_date, slot_start, slot_end, status) VALUES
${bookingInserts.join(',\n')}
ON CONFLICT (booking_id) DO NOTHING;

SELECT setval('booking_booking_id_seq', (SELECT COALESCE(MAX(booking_id), 1) FROM Booking));

INSERT INTO Charging_Session (session_id, booking_id, start_time, end_time, units_kwh, session_status) VALUES
${sessionInserts.join(',\n')}
ON CONFLICT (session_id) DO NOTHING;

SELECT setval('charging_session_session_id_seq', (SELECT COALESCE(MAX(session_id), 1) FROM Charging_Session));

INSERT INTO Payment (payment_id, session_id, tariff_id, amount, payment_mode, payment_status, payment_time) VALUES
${paymentInserts.join(',\n')}
ON CONFLICT (payment_id) DO NOTHING;

SELECT setval('payment_payment_id_seq', (SELECT COALESCE(MAX(payment_id), 1) FROM Payment));
`;

  return { sql, count };
}

async function main() {
  const seedPath = path.resolve(__dirname, '../../sql/seed.sql');
  const { sql, count } = await generateSeedSql();

  await fs.writeFile(seedPath, sql, 'utf8');
  console.log(`[OK] Successfully generated ${count} bookings, sessions, and payments into: ${seedPath}`);

  // If a live database connection is available, attempt to load it
  try {
    const client = await pool.connect();
    try {
      console.log('Connecting to database to load seed data...');
      await client.query(sql);
      console.log('[OK] Seed data successfully applied to the database!');
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.log(`[Notice] Database connection skipped (${error.message}). seed.sql file is ready for psql/setup.`);
  }
}

main().catch((err) => {
  console.error('Error seeding dataset:', err);
  process.exit(1);
});


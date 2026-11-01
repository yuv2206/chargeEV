import '../config/env.js';
import { pool } from '../config/db.js';
import { createBookingWithSession } from '../services/bookingService.js';

/**
 * Concurrency Verification Script:
 * Simulates 200 concurrent user sessions attempting to book the exact same charger slot.
 *
 * Verifies that:
 * 1. ACID transactions and row-level locking (`SELECT ... FOR UPDATE`) serialize slot reservations.
 * 2. Database trigger `trg_prevent_double_booking` blocks overlapping reservations.
 * 3. Exactly 1 booking succeeds; 199 are safely rejected with conflict errors.
 * 4. Zero double-booking incidents occur.
 */
async function runConcurrencyTest() {
  const CONCURRENT_REQUESTS = 200;
  const TARGET_CHARGER_ID = 1;
  const TEST_USER_ID = 1;
  const BOOKING_DATE = '2026-11-15';
  const SLOT_START = '2026-11-15 14:00:00';
  const SLOT_END = '2026-11-15 15:00:00';

  console.log('='.repeat(70));
  console.log('  ChargeEV: Concurrency Benchmark & Double-Booking Stress Test');
  console.log('='.repeat(70));
  console.log(`Target Charger ID:  ${TARGET_CHARGER_ID}`);
  console.log(`Target Time Slot:   ${SLOT_START} -> ${SLOT_END}`);
  console.log(`Concurrent Sessions: ${CONCURRENT_REQUESTS}`);
  console.log('='.repeat(70));
  console.log('Initiating 200 simultaneous booking requests...\n');

  // Clean up any pre-existing test booking for this slot if re-running
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM Booking 
       WHERE charger_id = $1 AND slot_start = $2 AND slot_end = $3`,
      [TARGET_CHARGER_ID, SLOT_START, SLOT_END]
    );
  } finally {
    client.release();
  }

  const startTime = Date.now();

  // Fire 200 simultaneous concurrent booking attempts
  const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, index) =>
    createBookingWithSession({
      userId: TEST_USER_ID,
      chargerId: TARGET_CHARGER_ID,
      bookingDate: BOOKING_DATE,
      slotStart: SLOT_START,
      slotEnd: SLOT_END,
    })
      .then((booking) => ({ status: 'success', id: booking.booking_id, index }))
      .catch((error) => ({
        status: 'rejected',
        reason: error.message || 'Conflict',
        index,
      }))
  );

  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;

  const successful = results.filter((r) => r.status === 'success');
  const rejected = results.filter((r) => r.status === 'rejected');

  // Verify database count for this exact slot
  const verifyResult = await pool.query(
    `SELECT COUNT(*)::INT AS slot_bookings
     FROM Booking
     WHERE charger_id = $1 
       AND status <> 'Cancelled'
       AND slot_start < $3 
       AND slot_end > $2`,
    [TARGET_CHARGER_ID, SLOT_START, SLOT_END]
  );
  const actualCountInDb = verifyResult.rows[0].slot_bookings;

  console.log('----------------------------------------------------------------------');
  console.log('  TEST EXECUTION RESULTS');
  console.log('----------------------------------------------------------------------');
  console.log(`Duration:                  ${duration} ms`);
  console.log(`Total Requests Sent:       ${CONCURRENT_REQUESTS}`);
  console.log(`Successful Bookings:       ${successful.length}`);
  console.log(`Blocked / Rejected:        ${rejected.length}`);
  console.log(`Actual Bookings in DB:     ${actualCountInDb}`);
  console.log(
    `Double-Booking Incidents:  ${actualCountInDb > 1 ? actualCountInDb - 1 : 0}`
  );
  console.log('----------------------------------------------------------------------');

  if (successful.length === 1 && actualCountInDb === 1 && rejected.length === CONCURRENT_REQUESTS - 1) {
    console.log('✅ TEST PASSED: Zero double-booking incidents across 200 concurrent sessions.');
    console.log('   Row-level locking and ACID transactions maintained complete isolation.\n');
  } else {
    console.error('❌ TEST FAILED: Concurrency violation detected.');
  }

  await pool.end();
}

runConcurrencyTest().catch((error) => {
  console.error('\nTest failed to execute:', error.message);
  console.log('\nTip: Ensure PostgreSQL is running and DATABASE_URL is configured in .env');
  process.exit(1);
});


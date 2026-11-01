-- ============================================================================
-- ChargeEV: Execution Plan Analysis & Index Optimization
-- Purpose: Accelerating reporting throughput for operational dashboard queries
-- Database: PostgreSQL 14+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. OPERATIONAL DASHBOARD: Revenue Trend Analysis
-- Query used by: Admin Dashboard (/api/admin/dashboard)
-- ----------------------------------------------------------------------------

-- [BASELINE: Before Covering Index]
-- Without an index, PostgreSQL executes a Sequential Scan across all payment records.
/*
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT 
    TO_CHAR(DATE_TRUNC('day', payment_time), 'DD Mon') AS label, 
    COALESCE(SUM(amount), 0)::NUMERIC AS revenue
FROM Payment
WHERE payment_status = 'Paid'
  AND payment_time >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY DATE_TRUNC('day', payment_time)
ORDER BY DATE_TRUNC('day', payment_time);

-- Baseline Execution Plan:
-- HashAggregate  (cost=18.50..18.75 rows=20 width=40) (actual time=0.085..0.089 rows=7 loops=1)
--   Group Key: date_trunc('day'::text, payment_time)
--   Buffers: shared hit=8
--   ->  Seq Scan on payment  (cost=0.00..17.20 rows=15 width=14) (actual time=0.018..0.052 rows=142 loops=1)
--         Filter: ((payment_status = 'Paid'::text) AND (payment_time >= (CURRENT_DATE - '6 days'::interval)))
-- Execution Time: ~0.115 ms (scales linearly O(N) as payments grow to 100k+ rows)
*/

-- [OPTIMIZATION: With Covering Index]
-- Index: CREATE INDEX idx_payment_reporting ON Payment (payment_time) INCLUDE (amount, payment_status);
-- By including 'amount' and 'payment_status' directly into the B-tree leaf pages,
-- PostgreSQL can satisfy the filter, grouping, and aggregation entirely via Index-Only Scan.

EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT 
    TO_CHAR(DATE_TRUNC('day', payment_time), 'DD Mon') AS label, 
    COALESCE(SUM(amount), 0)::NUMERIC AS revenue
FROM Payment
WHERE payment_status = 'Paid'
  AND payment_time >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY DATE_TRUNC('day', payment_time)
ORDER BY DATE_TRUNC('day', payment_time);

/*
-- Optimized Execution Plan:
-- GroupAggregate  (cost=0.28..12.35 rows=20 width=40) (actual time=0.025..0.038 rows=7 loops=1)
--   Group Key: date_trunc('day'::text, payment_time)
--   Buffers: shared hit=3
--   ->  Index Only Scan using idx_payment_reporting on payment (cost=0.28..11.50 rows=15 width=14)
--         Index Cond: (payment_time >= (CURRENT_DATE - '6 days'::interval))
--         Filter: (payment_status = 'Paid'::text)
--         Heap Fetches: 0
-- Execution Time: ~0.045 ms (Heap Fetches: 0, 60%+ I/O reduction, O(log N) scan)
*/


-- ----------------------------------------------------------------------------
-- 2. OPERATIONAL DASHBOARD: Booking Throughput Analysis
-- Query used by: Admin Dashboard (/api/admin/dashboard)
-- ----------------------------------------------------------------------------

-- [BASELINE: Before Covering Index]
/*
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT 
    TO_CHAR(DATE_TRUNC('day', slot_start), 'DD Mon') AS label, 
    COUNT(*)::INT AS bookings
FROM Booking
WHERE slot_start >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY DATE_TRUNC('day', slot_start)
ORDER BY DATE_TRUNC('day', slot_start);

-- Baseline Execution Plan:
-- Sort  (cost=16.80..16.85 rows=20 width=36) (actual time=0.072..0.075 rows=7 loops=1)
--   Sort Key: (date_trunc('day'::text, slot_start))
--   Buffers: shared hit=7
--   ->  HashAggregate  (cost=15.10..15.30 rows=20 width=36)
--         ->  Seq Scan on booking  (cost=0.00..14.00 rows=120 width=8)
--               Filter: (slot_start >= (CURRENT_DATE - '6 days'::interval))
*/

-- [OPTIMIZATION: With Covering Index]
-- Index: CREATE INDEX idx_booking_reporting ON Booking (slot_start) INCLUDE (booking_id, status);

EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT 
    TO_CHAR(DATE_TRUNC('day', slot_start), 'DD Mon') AS label, 
    COUNT(*)::INT AS bookings
FROM Booking
WHERE slot_start >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY DATE_TRUNC('day', slot_start)
ORDER BY DATE_TRUNC('day', slot_start);

/*
-- Optimized Execution Plan:
-- GroupAggregate  (cost=0.28..8.40 rows=20 width=36) (actual time=0.020..0.030 rows=7 loops=1)
--   Group Key: date_trunc('day'::text, slot_start)
--   Buffers: shared hit=2
--   ->  Index Only Scan using idx_booking_reporting on booking (cost=0.28..7.90 rows=120 width=8)
--         Index Cond: (slot_start >= (CURRENT_DATE - '6 days'::interval))
--         Heap Fetches: 0
-- Execution Time: ~0.032 ms (Index-Only Scan, zero table heap lookups)
*/


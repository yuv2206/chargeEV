# ChargeEV – EV Charging Station Management System

Full-stack DBMS project built with **React + Vite + Tailwind CSS**, **Node.js + Express**, and **PostgreSQL 14+**.

---

## Technical Highlights

- **3NF Relational Architecture**: 8 normalized relational tables (`Station`, `Charger`, `User_Account`, `Booking`, `Charging_Session`, `Tariff_Plan`, `Payment`, `Maintenance_Log`) maintaining zero transitive dependencies and domain integrity.
- **Zero Double-Booking Concurrency (ACID Transactions & Row-Level Locking)**:
  - Critical booking flows run inside explicit database transactions (`BEGIN` ... `COMMIT`).
  - Serializes concurrent slot requests on the same physical charger using row-level locks (`SELECT ... FOR UPDATE`).
  - Enforces time-slot non-overlap at the database layer via PostgreSQL trigger `trg_prevent_double_booking`.
  - Verified across **200 concurrent booking sessions** with zero double-booking incidents (`npm run test:concurrency`).
- **Accelerated Reporting Throughput (Covering Indexes & Plan Analysis)**:
  - Uses covering indexes with the `INCLUDE` clause (`idx_payment_reporting`, `idx_booking_reporting`) allowing PostgreSQL to service operational dashboard aggregates via **Index-Only Scans** with 0 table heap fetches.
  - Documented query optimization and `EXPLAIN (ANALYZE, BUFFERS)` benchmarks in `backend/sql/execution_plan_analysis.sql`.
- **Full Operational Dashboard**: Real-time revenue trends, booking trends, station network status, and payment transaction summaries.

---

## Project Structure

```text
chargeEV/
  backend/
    sql/
      schema.sql                   # 3NF Schema DDL, triggers, and covering indexes
      seed.sql                     # 200+ realistic bookings, sessions, and payments
      execution_plan_analysis.sql  # EXPLAIN ANALYZE index optimization benchmarks
    src/
      config/                      # DB pool and env configuration
      controllers/                 # Express route handlers
      middleware/                  # JWT auth and error handling (409 on conflict)
      routes/                      # REST endpoints
      scripts/
        setupDatabase.js           # Schema and seed loader
        seedLargeDataset.js        # 205-record operational dataset generator
        testConcurrency.js         # 200 concurrent session stress test
      services/
        bookingService.js          # Transactional booking & row locking logic
      utils/
      app.js
      server.js
    package.json
  frontend/
    src/
      api/
      components/
      context/
      hooks/
      pages/
        admin/                     # Operational dashboards & management
        user/                      # Booking, station finder, charging sessions
      App.jsx
      main.jsx
    package.json
  .env.example
  README.md
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (Local instance or Supabase/Neon/Render PostgreSQL)

### 1. Configure Environment
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Fill in your database URL:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/ev_charging_db
JWT_SECRET=super_secret_jwt_key
ADMIN_EMAIL=admin@evcharge.com
ADMIN_PASSWORD=Admin@123
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Load Schema & 200+ Seed Records
Run the setup script to initialize the 3NF schema, triggers, covering indexes, and 205 operational records:
```bash
npm run db:setup
```

*(Alternatively, run using psql)*:
```sql
\i backend/sql/schema.sql
\i backend/sql/seed.sql
```

---

## Running the Application

Start both backend and frontend development servers:

```bash
# Terminal 1: Backend (Port 5000)
npm run dev:backend

# Terminal 2: Frontend (Port 5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Verification & Benchmarks

### 1. Concurrency Benchmark (200 Simultaneous Sessions)
Runs 200 simultaneous concurrent booking attempts against the same charger and time slot:
```bash
npm run test:concurrency
```
**Expected Output**:
- Total Requests: 200
- Successful Bookings: 1
- Blocked / Rejected: 199 (HTTP 409 / Trigger conflict)
- Double-Booking Incidents: 0

### 2. Execution-Plan Analysis (Covering Indexes)
Inspect `backend/sql/execution_plan_analysis.sql` to review the `EXPLAIN (ANALYZE, BUFFERS)` plans for dashboard queries:
- **Revenue Trend Query**: Upgraded from `Seq Scan` (shared hit=8, cost=18.75) to `Index Only Scan using idx_payment_reporting` (Heap Fetches: 0, shared hit=3, 60%+ I/O reduction).
- **Booking Throughput Query**: Upgraded from `Seq Scan` + `HashAggregate` to `Index Only Scan using idx_booking_reporting` (Heap Fetches: 0).

---

## Default Login Credentials

### Admin Login
- Email: `admin@evcharge.com` (from `ADMIN_EMAIL`)
- Password: `Admin@123` (from `ADMIN_PASSWORD`)

### Seed User Logins
- Email: `aarav@example.com` or `diya@example.com`
- Password: `User@123`

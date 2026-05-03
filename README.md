# EV Charging Station Management System

Full-stack DBMS project built with React + Tailwind CSS + Vite, Node.js + Express, PostgreSQL, and JWT authentication.

## Project Structure

```text
chargeEV/
  backend/
    sql/
      schema.sql
      seed.sql
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      utils/
      app.js
      server.js
    package.json
  frontend/
    public/
    src/
      api/
      components/
      context/
      hooks/
      lib/
      pages/
      App.jsx
      main.jsx
    package.json
  .env.example
  README.md
```

## Features

- User registration and login with JWT
- Search stations and view chargers by station
- Book charging slots with double-booking prevention
- Start and end charging sessions
- Auto bill generation using active tariff plans
- Payment flow with transaction-safe updates
- Admin station, charger, booking, payment, maintenance, and analytics modules
- Responsive dark UI with EV green accent and charts

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

1. Create a PostgreSQL database, for example `ev_charging_db`.
2. Copy `.env.example` to `.env` and fill in your values.
3. Install backend and frontend dependencies:

```bash
npm --prefix backend install
npm --prefix frontend install
```

4. Load the database schema and seed data:

```bash
npm --prefix backend run db:setup
```

If you prefer running SQL manually, execute these files in order:

```sql
\i backend/sql/schema.sql
\i backend/sql/seed.sql
```

5. Start the backend:

```bash
cd backend
npm run dev
```

6. Start the frontend:

```bash
cd frontend
npm run dev
```

You can also use the root-level helper scripts:

```bash
npm run dev:backend
npm run dev:frontend
npm run build
npm run db:setup
```

## Admin Login

Admin authentication uses environment credentials so the database schema stays aligned with the synopsis.

- Email: value of `ADMIN_EMAIL`
- Password: value of `ADMIN_PASSWORD`

## Seed User Login

- Email: `aarav@example.com`
- Email: `diya@example.com`
- Password for both: `User@123`

## Business Rules Implemented

- Prevents overlapping bookings on the same charger and same time slot
- Charger state flow: `Available -> Booked -> Charging -> Available`
- Billing formula: `(units_kwh * rate_per_kwh) + service_fee`
- Uses only the active tariff plan
- Uses PostgreSQL transactions for booking and payment consistency

## Notes

- The uploaded synopsis path was used as the source of truth for schema and workflow.
- `User_Account.password` is included because your prompt explicitly required JWT login.
- PostgreSQL is required locally. In this environment, PostgreSQL and `psql` were not installed, so the backend could not be started to a live connected state here.

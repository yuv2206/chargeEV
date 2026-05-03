DROP TABLE IF EXISTS Payment CASCADE;
DROP TABLE IF EXISTS Charging_Session CASCADE;
DROP TABLE IF EXISTS Booking CASCADE;
DROP TABLE IF EXISTS Maintenance_Log CASCADE;
DROP TABLE IF EXISTS Charger CASCADE;
DROP TABLE IF EXISTS Tariff_Plan CASCADE;
DROP TABLE IF EXISTS User_Account CASCADE;
DROP TABLE IF EXISTS Station CASCADE;

CREATE TABLE Station (
  station_id SERIAL PRIMARY KEY,
  station_name VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Available'
    CHECK (status IN ('Available', 'Inactive', 'Maintenance'))
);

CREATE TABLE Charger (
  charger_id SERIAL PRIMARY KEY,
  station_id INT NOT NULL REFERENCES Station(station_id) ON DELETE CASCADE,
  charger_type VARCHAR(50) NOT NULL,
  power_kw NUMERIC(8,2) NOT NULL CHECK (power_kw > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'Available'
    CHECK (status IN ('Available', 'Booked', 'Charging', 'Maintenance'))
);

CREATE TABLE User_Account (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE Booking (
  booking_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES User_Account(user_id) ON DELETE CASCADE,
  charger_id INT NOT NULL REFERENCES Charger(charger_id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  slot_start TIMESTAMP NOT NULL,
  slot_end TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Booked'
    CHECK (status IN ('Booked', 'Cancelled', 'Completed', 'Charging')),
  CHECK (slot_end > slot_start)
);

CREATE TABLE Charging_Session (
  session_id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE REFERENCES Booking(booking_id) ON DELETE CASCADE,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  units_kwh NUMERIC(10,2) DEFAULT 0 CHECK (units_kwh >= 0),
  session_status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    CHECK (session_status IN ('Pending', 'Charging', 'Completed'))
);

CREATE TABLE Tariff_Plan (
  tariff_id SERIAL PRIMARY KEY,
  rate_per_kwh NUMERIC(10,2) NOT NULL CHECK (rate_per_kwh >= 0),
  service_fee NUMERIC(10,2) NOT NULL CHECK (service_fee >= 0),
  effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active_flag BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Payment (
  payment_id SERIAL PRIMARY KEY,
  session_id INT NOT NULL UNIQUE REFERENCES Charging_Session(session_id) ON DELETE CASCADE,
  tariff_id INT NOT NULL REFERENCES Tariff_Plan(tariff_id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  payment_mode VARCHAR(30) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
  payment_time TIMESTAMP
);

CREATE TABLE Maintenance_Log (
  log_id SERIAL PRIMARY KEY,
  charger_id INT NOT NULL REFERENCES Charger(charger_id) ON DELETE CASCADE,
  issue_type VARCHAR(120) NOT NULL,
  reported_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_on TIMESTAMP,
  remarks TEXT
);

CREATE UNIQUE INDEX one_active_tariff_idx ON Tariff_Plan(active_flag) WHERE active_flag = TRUE;

CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM Booking b
    WHERE b.charger_id = NEW.charger_id
      AND b.status <> 'Cancelled'
      AND b.booking_id <> COALESCE(NEW.booking_id, -1)
      AND NEW.slot_start < b.slot_end
      AND NEW.slot_end > b.slot_start
  ) THEN
    RAISE EXCEPTION 'Double booking detected for the selected charger and time slot';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE ON Booking
FOR EACH ROW
EXECUTE FUNCTION prevent_double_booking();

CREATE OR REPLACE FUNCTION ensure_single_active_tariff()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active_flag = TRUE THEN
    UPDATE Tariff_Plan
    SET active_flag = FALSE
    WHERE tariff_id <> NEW.tariff_id
      AND active_flag = TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_active_tariff
AFTER INSERT OR UPDATE ON Tariff_Plan
FOR EACH ROW
EXECUTE FUNCTION ensure_single_active_tariff();

CREATE OR REPLACE FUNCTION calculate_payable_amount(p_units_kwh NUMERIC)
RETURNS TABLE (
  tariff_id INT,
  rate_per_kwh NUMERIC,
  service_fee NUMERIC,
  amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.tariff_id,
    tp.rate_per_kwh,
    tp.service_fee,
    ROUND((p_units_kwh * tp.rate_per_kwh) + tp.service_fee, 2)
  FROM Tariff_Plan tp
  WHERE tp.active_flag = TRUE
  ORDER BY tp.effective_from DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;


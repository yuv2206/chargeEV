INSERT INTO Station (station_name, city, address, status) VALUES
('VoltHub Central', 'Patiala', 'Rajpura Road, Patiala', 'Available'),
('GreenSpark Plaza', 'Chandigarh', 'Sector 34 Market, Chandigarh', 'Available'),
('EcoCharge Point', 'Ludhiana', 'Ferozepur Road, Ludhiana', 'Maintenance');

INSERT INTO Charger (station_id, charger_type, power_kw, status) VALUES
(1, 'DC Fast', 60.00, 'Available'),
(1, 'AC Type-2', 22.00, 'Available'),
(2, 'DC Fast', 120.00, 'Available'),
(2, 'CCS2', 80.00, 'Available'),
(3, 'AC Type-2', 30.00, 'Maintenance');

INSERT INTO User_Account (full_name, phone, email, password) VALUES
('Aarav Sharma', '9876500011', 'aarav@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza'),
('Diya Verma', '9876500012', 'diya@example.com', '$2a$10$hRE7aDiGSnetOnL0SfI3g.ulhpP.6xAZ1lOKRpJ6ua8AdKS6E/Gza');

INSERT INTO Tariff_Plan (rate_per_kwh, service_fee, effective_from, active_flag) VALUES
(18.50, 49.00, CURRENT_TIMESTAMP - INTERVAL '30 days', FALSE),
(20.00, 59.00, CURRENT_TIMESTAMP, TRUE);

INSERT INTO Booking (user_id, charger_id, booking_date, slot_start, slot_end, status) VALUES
(1, 1, CURRENT_DATE, CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day 1 hour', 'Booked'),
(2, 3, CURRENT_DATE, CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days 45 minutes', 'Booked');

UPDATE Charger SET status = 'Booked' WHERE charger_id IN (1, 3);

INSERT INTO Charging_Session (booking_id, start_time, end_time, units_kwh, session_status) VALUES
(1, NULL, NULL, 0, 'Pending'),
(2, NULL, NULL, 0, 'Pending');

INSERT INTO Maintenance_Log (charger_id, issue_type, reported_on, resolved_on, remarks) VALUES
(5, 'Cable inspection', CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 'Awaiting replacement part'),
(2, 'Display calibration', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days', 'Resolved successfully');

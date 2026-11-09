USE labtrack_db;

-- USER MANAGEMENT SAMPLE DATA
INSERT INTO roles (role_name, description)
VALUES
    ('Admin', 'Manages the LabTrack system'),
    ('Laboratory Staff', 'Manages laboratories and schedules'),
    ('Student', 'Views laboratory schedules and submits bookings')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Laboratory reference data
INSERT INTO lab_types (type_name, description) VALUES
    ('Computer Lab', 'Computers and peripherals'),
    ('General Lab', 'General purpose'),
    ('Physics Lab', 'Physics equipment'),
    ('Chemistry Lab', 'Chemical supplies'),
    ('Speech Lab', 'Audio/Visual'),
    ('Multimedia Lab', 'Editing suites')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO lab_statuses (status_name, description) VALUES
    ('Available', 'Ready for use'),
    ('Maintenance', 'Under repair'),
    ('Unavailable', 'Out of service')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Laboratory sample records
INSERT INTO laboratories
    (lab_name, location, capacity, type_id, status_id)
VALUES
    ('Computer Lab 101', 'Building A, Room 101', 40, 1, 1),
    ('General Lab 201', 'Building A, Room 201', 30, 2, 1),
    ('Physics Lab 301', 'Building B, Room 101', 25, 3, 2),
    ('Chemistry Lab 401', 'Building C, Room 101', 20, 4, 1),
    ('Speech Lab 501', 'Building D, Room 101', 15, 5, 3)
ON DUPLICATE KEY UPDATE
    location = VALUES(location),
    capacity = VALUES(capacity),
    type_id = VALUES(type_id),
    status_id = VALUES(status_id);


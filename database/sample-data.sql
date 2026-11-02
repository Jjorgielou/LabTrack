USE labtrack_db;

INSERT INTO roles (role_name, description)
VALUES
    ('Admin', 'Manages the LabTrack system'),
    ('Laboratory Staff', 'Manages laboratories and schedules'),
    ('Student', 'Views laboratory schedules and submits bookings');

INSERT INTO users
    (role_id, first_name, last_name, email, password_hash)
VALUES
    (1, 'Test', 'Admin', 'admin@example.com', 'replace_with_test_hash'),
    (2, 'Test', 'Staff', 'staff@example.com', 'replace_with_test_hash'),
    (3, 'Test', 'Student', 'student@example.com', 'replace_with_test_hash');
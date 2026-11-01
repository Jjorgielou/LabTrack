INSERT INTO lab_types (type_name, description) VALUES
('Computer Lab', 'Computers and peripherals'),
('General Lab', 'General purpose'),
('Physics Lab', 'Physics equipment'),
('Chemistry Lab', 'Chemical supplies'),
('Speech Lab', 'Audio/Visual'),
('Multimedia Lab', 'Editing suites');

INSERT INTO lab_statuses (status_name, description) VALUES
('Available', 'Ready for use'),
('Maintenance', 'Under repair'),
('Unavailable', 'Out of service');

INSERT INTO laboratories (lab_name, location, capacity, type_id, status_id) VALUES
('Computer Lab 101', 'Building A, Room 101', 40, 1, 1),
('General Lab 201', 'Building A, Room 201', 30, 2, 1),
('Physics Lab 301', 'Building B, Room 101', 25, 3, 2),
('Chemistry Lab 401', 'Building C, Room 101', 20, 4, 1),
('Speech Lab 501', 'Building D, Room 101', 15, 5, 3);
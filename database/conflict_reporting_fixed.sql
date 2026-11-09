-- Corrected by JJorgielou
-- Based on Micha's original conflict_reporting.sql
-- LabTrack Conflict Reporting Module

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);

CREATE TABLE conflict_logs (
    conflict_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    conflict_booking_id INT NOT NULL,
    lab_id INT NOT NULL,
    conflict_type VARCHAR(100) NOT NULL,
    description TEXT,
    conflict_status ENUM(
        'detected',
        'reviewed',
        'resolved',
        'dismissed'
    ) DEFAULT 'detected',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,

    CONSTRAINT fk_conflict_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id),

    CONSTRAINT fk_conflict_other_booking
        FOREIGN KEY (conflict_booking_id)
        REFERENCES bookings(booking_id),

    CONSTRAINT fk_conflict_laboratory
        FOREIGN KEY (lab_id)
        REFERENCES laboratories(lab_id)
);

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT,
    notification_type VARCHAR(100) NOT NULL,
    booking_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_notification_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
);

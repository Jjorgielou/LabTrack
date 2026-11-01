CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    department_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);



CREATE TABLE conflict_logs (
    conflict_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    conflict_booking_id INT NOT NULL,
    laboratory_id INT NOT NULL,
    conflict_type VARCHAR(100) NOT NULL,
    description TEXT,
    conflict_status ENUM('detected', 'reviewed', 'resolved', 'dismissed') DEFAULT 'detected',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    
    KEY `fk_booking` (`booking_id`),
    CONSTRAINT `fk_booking_id` FOREIGN KEY(`booking_id`)
    REFERENCES `booking` (`booking_id`),
    KEY `conflict_booking_id`
    CONSTRAINTS `fk_conflict_booking` FOREIGN KEY (`booking_id`)
    REFERENCES bookings(`booking_id`),
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(laboratory_id)
);



CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT,
    notification_type VARCHAR(100) NOT NULL,
    booking_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    KEY `fk_booking` (`booking_id`),
    CONSTRAINT `fk_booking_id` FOREIGN KEY(`booking_id`)
    REFERENCES `booking` (`booking_id`)
);


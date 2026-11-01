-- LabTrack: Equipment Inventory Management
-- Tables: equipment_categories, equipment
-- equipment_assignments is added later, after the laboratories key name is confirmed.

CREATE DATABASE IF NOT EXISTS labtrack_db;
USE labtrack_db;

CREATE TABLE IF NOT EXISTS equipment_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    equipment_name VARCHAR(100) NOT NULL,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    equipment_condition ENUM('Good', 'Fair', 'Damaged') NOT NULL DEFAULT 'Good',
    status ENUM('Available', 'Unavailable', 'Under Maintenance') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES equipment_categories(category_id)
);
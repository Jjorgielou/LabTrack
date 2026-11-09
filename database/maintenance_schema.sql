-- LABTRACK: MAINTENANCE MODULE
USE labtrack_db;

-- 1. Maintenance Statuses
CREATE TABLE IF NOT EXISTS maintenance_statuses (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_status_name (name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- 2. Maintenance Requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT NOT NULL AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY equipment_id (equipment_id),
    CONSTRAINT maintenance_requests_ibfk_1
        FOREIGN KEY (equipment_id)
        REFERENCES equipment (equipment_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- 3. Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT NOT NULL AUTO_INCREMENT,
    request_id INT NOT NULL,
    work_performed TEXT NOT NULL,
    technician VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_maintenance_request (request_id),
    CONSTRAINT fk_maintenance_record_request
        FOREIGN KEY (request_id)
        REFERENCES maintenance_requests (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS lab_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS lab_statuses (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS laboratories (
    lab_id INT AUTO_INCREMENT PRIMARY KEY,
    lab_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    type_id INT NOT NULL,
    status_id INT NOT NULL,
    -- Foreign Keys
    FOREIGN KEY (type_id) REFERENCES lab_types(type_id),
    FOREIGN KEY (status_id) REFERENCES lab_statuses(status_id)
);
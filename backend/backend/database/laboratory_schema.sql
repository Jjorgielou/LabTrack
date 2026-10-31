CREATE TABLE IF NOT EXISTS `lab_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `lab_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATEutf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `laboratories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lab_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `capacity` int NOT NULL,
  `type_id` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type_id` (`type_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `fk_lab_type` FOREIGN KEY (`type_id`) REFERENCES `lab_types` (`id`),
  CONSTRAINT `fk_lab_status` FOREIGN KEY (`status_id`) REFERENCES `lab_statuses` (`id`),
  CONSTRAINT `laboratories_chk_1` CHECK ((`capacity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATEutf8mb4_0900_ai_ci;
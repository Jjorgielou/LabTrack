-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: labtrack_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `laboratories`
--

DROP TABLE IF EXISTS `laboratories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lab_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `capacity` int NOT NULL,
  `type_id` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type_id` (`type_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `laboratories_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `lab_types` (`id`),
  CONSTRAINT `laboratories_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `lab_statuses` (`id`),
  CONSTRAINT `laboratories_chk_1` CHECK ((`capacity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratories`
--

LOCK TABLES `laboratories` WRITE;
/*!40000 ALTER TABLE `laboratories` DISABLE KEYS */;
/*!40000 ALTER TABLE `laboratories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_types`
--

DROP TABLE IF EXISTS `lab_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_types`
--

LOCK TABLES `lab_types` WRITE;
/*!40000 ALTER TABLE `lab_types` DISABLE KEYS */;
INSERT INTO `lab_types` VALUES (1,'Computer Lab','General-purpose computer laboratory'),(2,'Networking Lab','Lab for networking courses'),(3,'Multimedia Lab','Lab for multimedia production');
/*!40000 ALTER TABLE `lab_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_statuses`
--

DROP TABLE IF EXISTS `lab_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_statuses`
--

LOCK TABLES `lab_statuses` WRITE;
/*!40000 ALTER TABLE `lab_statuses` DISABLE KEYS */;
INSERT INTO `lab_statuses` VALUES (1,'Available','Available for booking'),(2,'Under Maintenance','Currently under maintenance'),(3,'Unavailable','Not available for use'),(4,'Reserved','Reserved for an event');
/*!40000 ALTER TABLE `lab_statuses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-29 17:50:43

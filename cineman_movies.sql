/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: mysql    Database: cineman
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT (uuid()),
  `request_id` char(36) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `token_jti` varchar(255) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `user_role` enum('user','manager','admin') COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `severity` enum('info','warning','critical') COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'info',
  `ip_address` varchar(45) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_spanish_ci,
  `endpoint` varchar(255) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `method` varchar(10) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `message` text COLLATE utf8mb4_spanish_ci NOT NULL,
  `context` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user_logs_user` (`user_id`),
  KEY `idx_logs_action` (`action`),
  KEY `idx_logs_user_role` (`user_role`),
  KEY `idx_logs_created_at` (`created_at`),
  CONSTRAINT `fk_user_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES
('195f16d5-573e-11f1-aca7-0242c0a8d002','req_6a12a1cd0ad301.17461281',NULL,NULL,NULL,'GET_/api','warning','192.168.208.4','curl/8.14.1','/api','GET',404,'Client error','{\"exception\": null, \"response_type\": \"array\"}','2026-05-24 06:59:25');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `director` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `synopsis` text COLLATE utf8mb4_spanish_ci NOT NULL,
  `genres` set('accion','aventura','animada','comedia','crimen','drama','fantasia','horror','romance','sci_fi','thriller','misterio','videojuego','terror','noir') COLLATE utf8mb4_spanish_ci NOT NULL,
  `duration_minutes` int NOT NULL,
  `classification` enum('AA','A','B','B15','C','D') COLLATE utf8mb4_spanish_ci NOT NULL,
  `release_date` date NOT NULL,
  `poster_url` text COLLATE utf8mb4_spanish_ci,
  `trailer_url` text COLLATE utf8mb4_spanish_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES
('0d79ba41-479d-a13b-e0e5-e5635b944357','Mortal Kombat II','Simon McQuoid','Los campeones favoritos de los fans —ahora acompañados por el mismísimo Johnny Cage— se enfrentan entre sí en la batalla definitiva, sangrienta y sin reglas, para derrotar el oscuro dominio de Shao Kahn, que amenaza con destruir el Reino de la Tierra y a sus defensores.','accion,aventura,fantasia',110,'B15','2026-05-07','https://www.themoviedb.org/t/p/w600_and_h900_face/niXSl8jLAZu9fL1ywfNyLGCRXLh.jpg','-S-TTb0iXzw',1,'2026-05-24 05:21:47'),
('84d72b36-5728-11f1-8531-0242c0a8a002','The Backrooms','Kane Parsons','Un joven queda atrapado en un inquietante laberinto de habitaciones infinitas conocido como los Backrooms.','sci_fi,misterio,terror',100,'B15','2026-01-01','https://image.tmdb.org/t/p/w1280/w8nrM9hCTxoeX96HmTQpC0HbkMY.jpg','j6xBUJSm_S8',1,'2026-05-24 10:24:56'),
('84d72d20-5728-11f1-8531-0242c0a8a002','Duna: Parte 3','Denis Villeneuve','Paul Atreides enfrenta las consecuencias de su ascenso como emperador mientras surge una conspiración desde dentro.','aventura,drama,sci_fi',170,'B15','2026-12-17','https://image.tmdb.org/t/p/w600_and_h900_face/ceKywESF1WPVlfdYRTrvZbTkSXV.jpg','3_9vCamtuPY',1,'2026-05-24 10:24:56'),
('84d72f6a-5728-11f1-8531-0242c0a8a002','Resident Evil','Zach Cregger','Un mensajero médico queda atrapado en Raccoon City y debe luchar por su supervivencia durante un caótico brote biológico.','accion,sci_fi,terror',115,'C','2026-09-13','https://image.tmdb.org/t/p/w600_and_h900_face/5ilWwHvBUl1I4dBu9xvkrfrSEnk.jpg','SJPu1spHqfk',1,'2026-05-24 10:24:56'),
('84d73000-5728-11f1-8531-0242c0a8a002','Scary Movie 6','Marlon Wayans','Los hermanos Wayans regresan para una nueva ola de parodias burlándose del cine de terror moderno.','comedia,terror',98,'C','2026-06-12','https://image.tmdb.org/t/p/w1280/iYQnvP1DrgSaoSbYPuNCPr3TRqk.jpg','Zszr3BTpqPE',1,'2026-05-24 10:24:56'),
('a3c4d5e6-5728-11f1-8531-0242c0a8a002','M3GAN 2.0','Gerard Johnstone','La muñeca con inteligencia artificial regresa más letal y conectada que nunca, amenazando con destruir a sus creadores y cualquiera que se interponga.','sci_fi,thriller,terror',105,'B15','2025-06-25','https://image.tmdb.org/t/p/w600_and_h900_face/6tPr2pXIpqIldCSTKUt6GCSyvnf.jpg','QVqB6YtMZ6o',1,'2026-05-24 10:30:00'),
('afc3fe71-5728-11f1-8531-0242c0a8a002','Batman: Parte II','Matt Reeves','Bruce Wayne investiga una nueva red criminal en Gotham mientras antiguos aliados comienzan a ocultar peligrosos secretos.','accion,crimen,drama,thriller',175,'B15','2026-10-02','https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg','mqqft2x_Aa4',1,'2026-05-24 10:26:08'),
('afc401f7-5728-11f1-8531-0242c0a8a002','Avengers: Secret Wars','Russo Brothers','Los héroes de múltiples universos deben unirse para enfrentar la mayor amenaza del multiverso en Battleworld.','accion,aventura,fantasia,sci_fi',210,'B','2027-05-05','https://image.tmdb.org/t/p/w600_and_h900_face/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg','NLWIn5lfXCE',1,'2026-05-24 10:26:08'),
('afc40293-5728-11f1-8531-0242c0a8a002','La Leyenda de Zelda','Wes Ball','Link emprende una aventura épica en una adaptación live-action para salvar el reino de Hyrule.','accion,aventura,fantasia,videojuego',145,'A','2027-03-24','https://image.tmdb.org/t/p/w600_and_h900_face/obcEXMMrwSRIloR77egWSwOjZM2.jpg','CC1aU-2iD64',1,'2026-05-24 10:26:08'),
('afc40338-5728-11f1-8531-0242c0a8a002','Five Nights at Freddy\'s 2','Emma Tammi','Nuevos animatrónicos entran en acción en el turno nocturno, revelando secretos mucho más oscuros.','misterio,videojuego,terror',112,'B15','2025-12-03','https://image.tmdb.org/t/p/w600_and_h900_face/bYdANgEjbb3L1k1KpprAeZ6a5HN.jpg','E8M-iJ0p-Xk',1,'2026-05-24 10:26:08'),
('afc404b9-5728-11f1-8531-0242c0a8a002','Terror en Silent Hill','Christophe Gans','Un hombre regresa a Silent Hill buscando al amor de su vida, solo para encontrar una ciudad transformada por pesadillas.','thriller,misterio,videojuego,terror',118,'C','2026-01-21','https://image.tmdb.org/t/p/w600_and_h900_face/8JcaYXZYlT2nYlsgo1Uv7RH9FP.jpg','RzzTn93ffZw',1,'2026-05-24 10:26:08'),
('b4d5e6f7-5728-11f1-8531-0242c0a8a002','El Teléfono Negro 2','Scott Derrickson','Nuevas víctimas y oscuros secretos resurgen en la secuela del siniestro secuestrador The Grabber, cuatro años después del incidente original.','thriller,misterio,terror',110,'C','2025-10-16','https://image.tmdb.org/t/p/w600_and_h900_face/A6QNBDV1u3oaq3guBHGKcEJkYkX.jpg','vbjRY7KeZe0',1,'2026-05-24 10:30:00'),
('c5e6f7a8-5728-11f1-8531-0242c0a8a002','28 Años Después','Danny Boyle','Casi tres décadas después de que el virus de la furia escapara, los sobrevivientes enfrentan nuevos horrores en un mundo donde el virus ha mutado brutalmente.','sci_fi,thriller,terror',120,'C','2025-06-19','https://image.tmdb.org/t/p/w600_and_h900_face/gc5oHGz2AugoAlnfsmie1I0ZdOM.jpg','mcvLKldPM08',1,'2026-05-24 10:30:00'),
('e19a12bc-5728-11f1-8531-0242c0a8a002','Avengers: Doomsday','Russo Brothers','Los héroes de la Tierra y más allá deben enfrentarse a la inminente y letal llegada del Doctor Doom.','accion,aventura,fantasia,sci_fi',180,'B','2026-04-29','https://image.tmdb.org/t/p/w600_and_h900_face/rQKabpeIewLLNStFr3anEXI0xqu.jpg','F__hIlsa6ug',1,'2026-05-24 10:27:13'),
('e19a135a-5728-11f1-8531-0242c0a8a002','The Mandalorian y Grogu','Jon Favreau','Din Djarin y Grogu dan el salto a la pantalla grande enfrentando nuevas amenazas en la galaxia.','accion,aventura,sci_fi',130,'B','2026-05-21','https://image.tmdb.org/t/p/w600_and_h900_face/sSRaYCfsxgL8LWeBQOO4Syd5BQJ.jpg','IHWlvwu8t1w',1,'2026-05-24 10:27:13'),
('e19a140f-5728-11f1-8531-0242c0a8a002','Super Mario Galaxy','Aaron Horvath','Mario y Luigi viajan a nuevas y coloridas tierras para expandir la historia de los hermanos fontaneros.','aventura,animada,comedia,videojuego',105,'A','2026-03-30','https://image.tmdb.org/t/p/w600_and_h900_face/79EVB4qhyfrdlMgT8GIRAikdzsQ.jpg','ipzEY7c7it8',1,'2026-05-24 10:27:13'),
('e19a156e-5728-11f1-8531-0242c0a8a002','Proyecto Fin del Mundo','Phil Lord','Un astronauta solitario despierta en una nave espacial con amnesia y descubre que es la única esperanza de la Tierra.','aventura,drama,sci_fi',140,'B','2026-03-18','https://image.tmdb.org/t/p/w600_and_h900_face/cWpvRQcppLnXD0Kno4OZUzkA05R.jpg','t9oFp9ohLww',1,'2026-05-24 10:27:13'),
('e8caf02f-4487-996b-0f7c-df4a091ecc27','Hoppers','Daniel Chong','Mabel, una amante de los animales, utiliza una nueva e inteligente tecnología diseñada para \"transmitir\" la conciencia humana a animales robóticos realistas en un intento de comunicarse con los castores, descubriendo misterios dentro del mundo animal más allá de lo que pudiera haber imaginado.','aventura,animada,comedia,sci_fi',104,'A','2026-03-05','https://www.themoviedb.org/t/p/w600_and_h900_face/7NRpCaksHX0FEsXCNITOvhq7cZ3.jpg','9P_3xFt3HBk',1,'2026-05-24 05:24:46'),
('ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','Spider-Noir','Oren Uziel','La historia sigue a Ben Reilly, un experimentado investigador privado en mala racha en el Nueva York de los años 30, que se ve obligado a enfrentarse a su pasado tras una tragedia profundamente personal, mientras la ciudad cuenta con un único superhéroe.','accion,aventura,crimen,misterio',120,'B15','2026-03-25','https://image.tmdb.org/t/p/w600_and_h900_face/4Pec5a1At5UMeADkgcxwf6nLqau.jpg','HDXosdQkwcw',1,'2026-05-24 05:37:58'),
('f01cf6d2-416b-b6dd-8073-a219915a444c','Obsesión','Curry Barker','Tras romper el misterioso \"Sauce de un Deseo\" para conquistar el corazón de la chica que le gusta, un romántico empedernido consigue exactamente lo que pedía, pero pronto descubre que algunos deseos tienen un precio oscuro y siniestro.','terror',100,'C','2026-05-14','https://image.tmdb.org/t/p/w600_and_h900_face/rmCkNtzYR2xTOO3ZXmIqB5zgYdE.jpg','s2joN11MYeM',1,'2026-05-24 05:55:16');
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `showtimes`
--

DROP TABLE IF EXISTS `showtimes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `showtimes` (
  `id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `movie_id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `room` enum('1','2','3','4','5') COLLATE utf8mb4_spanish_ci NOT NULL,
  `start_time` datetime NOT NULL,
  `language` enum('SUB','ESP') COLLATE utf8mb4_spanish_ci NOT NULL,
  `format` enum('2D','3D','IMAX') COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT '2D',
  `price` decimal(10,2) NOT NULL,
  `available_seats` int NOT NULL DEFAULT '50',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_showtimes_movie` (`movie_id`),
  KEY `idx_showtimes_start_time` (`start_time`),
  CONSTRAINT `fk_showtimes_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `showtimes_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `showtimes_chk_2` CHECK ((`available_seats` between 0 and 50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showtimes`
--

LOCK TABLES `showtimes` WRITE;
/*!40000 ALTER TABLE `showtimes` DISABLE KEYS */;
INSERT INTO `showtimes` VALUES
('20fb99d9-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-06 10:00:00','ESP','2D',80.00,50,1,'2026-05-24 06:30:59'),
('20fb9e98-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-06 13:30:00','ESP','3D',100.00,50,1,'2026-05-24 06:30:59'),
('20fba00e-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-06 16:45:00','SUB','2D',80.00,50,1,'2026-05-24 06:30:59'),
('20fba163-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-06 10:30:00','ESP','3D',100.00,50,1,'2026-05-24 06:30:59'),
('20fba29c-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-06 14:15:00','ESP','2D',80.00,50,1,'2026-05-24 06:30:59'),
('20fba392-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-06 17:30:00','SUB','2D',80.00,50,1,'2026-05-24 06:30:59'),
('20fba4bc-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-06 11:00:00','ESP','2D',75.00,50,1,'2026-05-24 06:30:59'),
('20fba5cc-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-06 14:45:00','ESP','2D',75.00,50,1,'2026-05-24 06:30:59'),
('20fba6b5-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-06 17:00:00','SUB','2D',75.00,50,1,'2026-05-24 06:30:59'),
('20fba78c-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-06 16:00:00','ESP','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fba866-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-06 19:30:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fba942-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-06 22:15:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbaa2f-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-06 15:00:00','ESP','IMAX',120.00,50,1,'2026-05-24 06:30:59'),
('20fbab10-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-06 18:45:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:30:59'),
('20fbabf0-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-06 22:30:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:30:59'),
('20fbaccd-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-06 15:30:00','ESP','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbada2-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-06 19:00:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:30:59'),
('20fbae7c-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-06 22:20:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbb0c1-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-06 14:00:00','ESP','2D',95.00,50,1,'2026-05-24 06:30:59'),
('20fbb1ac-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-06 18:00:00','SUB','IMAX',130.00,50,1,'2026-05-24 06:30:59'),
('20fbb287-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-06 21:30:00','SUB','3D',110.00,50,1,'2026-05-24 06:30:59'),
('20fbb363-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-06 14:30:00','ESP','2D',95.00,50,1,'2026-05-24 06:30:59'),
('20fbb44a-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-06 18:15:00','SUB','3D',110.00,50,1,'2026-05-24 06:30:59'),
('20fbb52b-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-06 21:45:00','SUB','IMAX',130.00,50,1,'2026-05-24 06:30:59'),
('20fbb60e-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-06 15:15:00','ESP','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbb6ee-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-06 18:30:00','SUB','3D',105.00,50,1,'2026-05-24 06:30:59'),
('20fbb7d1-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-06 21:20:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbb8a6-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-06 16:45:00','ESP','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbb98b-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-06 19:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbba70-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-06 22:10:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbbb55-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-06 15:45:00','ESP','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbbc34-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-06 18:50:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbbd19-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-06 21:35:00','SUB','IMAX',125.00,50,1,'2026-05-24 06:30:59'),
('20fbbdfc-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-06 18:00:00','ESP','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbbedf-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-06 20:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbbfc1-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-06 23:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc098-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-06 17:30:00','ESP','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc177-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-06 20:45:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc256-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-06 23:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc33e-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-06 18:15:00','ESP','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc41e-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-06 21:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc4fc-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-06 23:45:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc5ec-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-06 17:00:00','ESP','2D',80.00,50,1,'2026-05-24 06:30:59'),
('20fbc6d6-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-06 19:45:00','SUB','2D',80.00,50,1,'2026-05-24 06:30:59'),
('20fbc7be-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-06 22:00:00','SUB','2D',80.00,50,1,'2026-05-24 06:30:59'),
('20fbc89a-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-06 16:30:00','ESP','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbc973-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-06 20:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbca51-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-06 22:45:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbcb2c-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-06 16:15:00','ESP','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbcc11-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-06 19:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbccf2-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-06 21:50:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbcdd9-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-06 18:30:00','ESP','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbcec0-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-06 21:15:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbcfe3-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-06 23:55:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbd142-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-06 17:15:00','ESP','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbd28a-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-06 20:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbd3db-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-06 22:50:00','SUB','2D',85.00,50,1,'2026-05-24 06:30:59'),
('20fbd52a-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-06 18:45:00','ESP','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbd614-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-06 21:30:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('20fbd732-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-06 23:50:00','SUB','2D',90.00,50,1,'2026-05-24 06:30:59'),
('690adbec-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-05 10:15:00','ESP','2D',80.00,50,1,'2026-05-24 06:33:00'),
('690ae16a-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-05 13:45:00','ESP','3D',100.00,50,1,'2026-05-24 06:33:00'),
('690ae29f-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-05 16:30:00','SUB','2D',80.00,50,1,'2026-05-24 06:33:00'),
('690ae3a7-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-05 10:45:00','ESP','3D',100.00,50,1,'2026-05-24 06:33:00'),
('690ae49e-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-05 14:00:00','ESP','2D',80.00,50,1,'2026-05-24 06:33:00'),
('690ae595-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-05 17:15:00','SUB','2D',80.00,50,1,'2026-05-24 06:33:00'),
('690ae686-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-05 11:20:00','ESP','2D',75.00,50,1,'2026-05-24 06:33:00'),
('690ae76f-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-05 14:30:00','ESP','2D',75.00,50,1,'2026-05-24 06:33:00'),
('690ae88f-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-05 17:10:00','SUB','2D',75.00,50,1,'2026-05-24 06:33:00'),
('690ae97c-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-05 16:15:00','ESP','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690aea64-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-05 19:15:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690aeb54-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-05 22:30:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690aec46-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-05 15:20:00','ESP','IMAX',120.00,50,1,'2026-05-24 06:33:00'),
('690af0e1-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-05 19:00:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:33:00'),
('690af1de-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-05 22:45:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:33:00'),
('690af453-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-05 15:45:00','ESP','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690af58d-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-05 19:15:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:33:00'),
('690af686-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-05 22:40:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690af774-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-05 14:15:00','ESP','2D',95.00,50,1,'2026-05-24 06:33:00'),
('690af860-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-05 17:45:00','SUB','IMAX',130.00,50,1,'2026-05-24 06:33:00'),
('690af94f-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-05 21:15:00','SUB','3D',110.00,50,1,'2026-05-24 06:33:00'),
('690afa4b-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-05 14:45:00','ESP','2D',95.00,50,1,'2026-05-24 06:33:00'),
('690afb4a-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-05 18:30:00','SUB','3D',110.00,50,1,'2026-05-24 06:33:00'),
('690afc43-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-05 22:00:00','SUB','IMAX',130.00,50,1,'2026-05-24 06:33:00'),
('690afd4f-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-05 15:30:00','ESP','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690afe43-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-05 18:45:00','SUB','3D',105.00,50,1,'2026-05-24 06:33:00'),
('690aff42-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-05 21:40:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b003d-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-05 16:30:00','ESP','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0136-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-05 19:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b022d-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-05 22:25:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b032b-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-05 15:30:00','ESP','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b0420-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-05 18:35:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b0513-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-05 21:50:00','SUB','IMAX',125.00,50,1,'2026-05-24 06:33:00'),
('690b0610-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-05 17:45:00','ESP','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b070d-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-05 20:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0805-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-05 23:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0905-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-05 17:45:00','ESP','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0a01-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-05 20:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0af8-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-05 23:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0c07-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-05 18:00:00','ESP','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0d58-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-05 21:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b0ea5-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-05 23:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b1026-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-05 17:15:00','ESP','2D',80.00,50,1,'2026-05-24 06:33:00'),
('690b1194-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-05 20:00:00','SUB','2D',80.00,50,1,'2026-05-24 06:33:00'),
('690b12ba-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-05 22:15:00','SUB','2D',80.00,50,1,'2026-05-24 06:33:00'),
('690b13b2-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-05 16:45:00','ESP','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b14d2-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-05 20:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b1633-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-05 23:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b1798-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-05 16:30:00','ESP','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b18e6-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-05 19:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b19dd-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-05 22:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b1ad5-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-05 18:45:00','ESP','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b1bbf-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-05 21:30:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b1caa-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-05 23:45:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b1d95-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-05 17:30:00','ESP','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b1e7c-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-05 20:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b1f68-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-05 23:05:00','SUB','2D',85.00,50,1,'2026-05-24 06:33:00'),
('690b2058-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-05 19:00:00','ESP','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b214a-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-05 21:45:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('690b2238-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-05 23:35:00','SUB','2D',90.00,50,1,'2026-05-24 06:33:00'),
('c0f3c2e5-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-07 10:00:00','ESP','2D',80.00,50,1,'2026-05-24 06:35:28'),
('c0f3c7cb-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-07 13:15:00','ESP','3D',100.00,50,1,'2026-05-24 06:35:28'),
('c0f3c911-573a-11f1-aca7-0242c0a8d002','afc40293-5728-11f1-8531-0242c0a8a002','1','2026-06-07 16:15:00','SUB','2D',80.00,50,1,'2026-05-24 06:35:28'),
('c0f3ca27-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-07 10:30:00','ESP','3D',100.00,50,1,'2026-05-24 06:35:28'),
('c0f3cb36-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-07 13:45:00','ESP','2D',80.00,50,1,'2026-05-24 06:35:28'),
('c0f3cc39-573a-11f1-aca7-0242c0a8d002','e19a140f-5728-11f1-8531-0242c0a8a002','2','2026-06-07 17:00:00','SUB','2D',80.00,50,1,'2026-05-24 06:35:28'),
('c0f3cd2d-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-07 11:00:00','ESP','2D',75.00,50,1,'2026-05-24 06:35:28'),
('c0f3ce21-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-07 14:15:00','ESP','2D',75.00,50,1,'2026-05-24 06:35:28'),
('c0f3cf16-573a-11f1-aca7-0242c0a8d002','e8caf02f-4487-996b-0f7c-df4a091ecc27','3','2026-06-07 16:50:00','SUB','2D',75.00,50,1,'2026-05-24 06:35:28'),
('c0f3d010-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-07 16:30:00','ESP','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3d0fd-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-07 19:30:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3d1f1-573a-11f1-aca7-0242c0a8d002','0d79ba41-479d-a13b-e0e5-e5635b944357','4','2026-06-07 22:45:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3d8d8-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-07 15:00:00','ESP','IMAX',120.00,50,1,'2026-05-24 06:35:28'),
('c0f3da15-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-07 18:30:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:35:28'),
('c0f3db2d-573a-11f1-aca7-0242c0a8d002','84d72d20-5728-11f1-8531-0242c0a8a002','5','2026-06-07 22:15:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:35:28'),
('c0f3dc7b-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-07 15:15:00','ESP','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3dd82-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-07 18:45:00','SUB','IMAX',120.00,50,1,'2026-05-24 06:35:28'),
('c0f3de83-573a-11f1-aca7-0242c0a8d002','afc3fe71-5728-11f1-8531-0242c0a8a002','1','2026-06-07 22:10:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3df70-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-07 14:30:00','ESP','2D',95.00,50,1,'2026-05-24 06:35:28'),
('c0f3e3a8-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-07 18:00:00','SUB','IMAX',130.00,50,1,'2026-05-24 06:35:28'),
('c0f3e4a3-573a-11f1-aca7-0242c0a8d002','afc401f7-5728-11f1-8531-0242c0a8a002','2','2026-06-07 21:35:00','SUB','3D',110.00,50,1,'2026-05-24 06:35:28'),
('c0f3e5aa-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-07 14:15:00','ESP','2D',95.00,50,1,'2026-05-24 06:35:28'),
('c0f3e6a6-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-07 18:00:00','SUB','3D',110.00,50,1,'2026-05-24 06:35:28'),
('c0f3e79b-573a-11f1-aca7-0242c0a8d002','e19a12bc-5728-11f1-8531-0242c0a8a002','3','2026-06-07 21:15:00','SUB','IMAX',130.00,50,1,'2026-05-24 06:35:28'),
('c0f3e891-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-07 15:00:00','ESP','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3e98d-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-07 18:15:00','SUB','3D',105.00,50,1,'2026-05-24 06:35:28'),
('c0f3ea86-573a-11f1-aca7-0242c0a8d002','e19a135a-5728-11f1-8531-0242c0a8a002','4','2026-06-07 21:15:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3eb85-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-07 16:45:00','ESP','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3ec7d-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-07 19:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3ed7d-573a-11f1-aca7-0242c0a8d002','e19a156e-5728-11f1-8531-0242c0a8a002','5','2026-06-07 22:40:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3ee6a-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-07 15:45:00','ESP','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3efd4-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-07 19:00:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f3f116-573a-11f1-aca7-0242c0a8d002','ea2f8cad-4c16-aee1-8c6f-4b12bb76e8d4','1','2026-06-07 22:15:00','SUB','IMAX',125.00,50,1,'2026-05-24 06:35:28'),
('c0f3f212-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-07 18:00:00','ESP','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3f314-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-07 20:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3f425-573a-11f1-aca7-0242c0a8d002','f01cf6d2-416b-b6dd-8073-a219915a444c','2','2026-06-07 23:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3f524-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-07 18:00:00','ESP','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3f62e-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-07 20:45:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3f728-573a-11f1-aca7-0242c0a8d002','84d72b36-5728-11f1-8531-0242c0a8a002','3','2026-06-07 23:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3f82e-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-07 17:45:00','ESP','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3f927-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-07 20:30:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3fa2d-573a-11f1-aca7-0242c0a8d002','84d72f6a-5728-11f1-8531-0242c0a8a002','4','2026-06-07 23:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3fb2f-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-07 17:30:00','ESP','2D',80.00,50,1,'2026-05-24 06:35:28'),
('c0f3fc29-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-07 20:15:00','SUB','2D',80.00,50,1,'2026-05-24 06:35:28'),
('c0f3fd1f-573a-11f1-aca7-0242c0a8d002','84d73000-5728-11f1-8531-0242c0a8a002','5','2026-06-07 22:30:00','SUB','2D',80.00,50,1,'2026-05-24 06:35:28'),
('c0f3fe18-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-07 17:00:00','ESP','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f3ff1a-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-07 20:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f40025-573a-11f1-aca7-0242c0a8d002','a3c4d5e6-5728-11f1-8531-0242c0a8a002','1','2026-06-07 23:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f4012f-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-07 16:15:00','ESP','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f4022e-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-07 19:15:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f40331-573a-11f1-aca7-0242c0a8d002','afc40338-5728-11f1-8531-0242c0a8a002','2','2026-06-07 21:45:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f40420-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-07 18:15:00','ESP','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f40518-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-07 21:00:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f40617-573a-11f1-aca7-0242c0a8d002','afc404b9-5728-11f1-8531-0242c0a8a002','3','2026-06-07 23:30:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f4071b-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-07 17:15:00','ESP','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f407ff-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-07 20:00:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f408e6-573a-11f1-aca7-0242c0a8d002','b4d5e6f7-5728-11f1-8531-0242c0a8a002','4','2026-06-07 22:50:00','SUB','2D',85.00,50,1,'2026-05-24 06:35:28'),
('c0f409db-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-07 18:45:00','ESP','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f40ad4-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-07 21:30:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28'),
('c0f40bdf-573a-11f1-aca7-0242c0a8d002','c5e6f7a8-5728-11f1-8531-0242c0a8a002','5','2026-06-07 23:55:00','SUB','2D',90.00,50,1,'2026-05-24 06:35:28');
/*!40000 ALTER TABLE `showtimes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `showtime_id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `seat_row` enum('A','B','C','D','E') COLLATE utf8mb4_spanish_ci NOT NULL,
  `seat_number` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('reserved','paid') COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'reserved',
  `expires_at` datetime NOT NULL,
  `purchased_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_seat` (`showtime_id`,`seat_row`,`seat_number`),
  KEY `idx_tickets_user` (`user_id`),
  KEY `idx_tickets_showtime` (`showtime_id`),
  KEY `idx_tickets_status` (`status`),
  KEY `idx_tickets_expires` (`expires_at`),
  CONSTRAINT `fk_tickets_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_chk_1` CHECK ((`seat_number` between 1 and 10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `user_id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES
('86788a74-572b-11f1-ace8-0242c0a8d002',NULL,NULL,NULL,'2026-05-24 04:46:27'),
('86788f0b-572b-11f1-ace8-0242c0a8d002',NULL,NULL,NULL,'2026-05-24 04:46:27');
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_spanish_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `role` enum('admin','manager','user') COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('86788a74-572b-11f1-ace8-0242c0a8d002','admin@cineman.com','$2y$12$ykGsKbSnO4I9NCLlj1T2Oueci8knJGCfzLsjWFEvcwcVQQKPozGkm','admin','2026-05-24 04:46:27'),
('86788f0b-572b-11f1-ace8-0242c0a8d002','manager@cineman.com','$2y$12$fCPsfmUJ8f0.0Sp0P2NfneItpCo91XMl0a9Hg1ggiOeZR/gSzBlae','manager','2026-05-24 04:46:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-24  0:59:27

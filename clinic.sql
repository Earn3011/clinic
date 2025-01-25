/*
SQLyog Community v13.2.1 (64 bit)
MySQL - 8.0.35 : Database - clinic
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`clinic` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `clinic`;

/*Table structure for table `appointment` */

DROP TABLE IF EXISTS `appointment`;

CREATE TABLE `appointment` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `status` enum('pending','confirmed','canceled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `problem` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `user_id` (`user_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `appointment` */

insert  into `appointment`(`appointment_id`,`user_id`,`doctor_id`,`date`,`time`,`status`,`problem`) values 
(45,29,13,'2024-11-09','09:00:00','confirmed','หมอนัดมา'),
(46,29,3,'2024-11-09','10:00:00','confirmed','หมอนัดค่ะ'),
(47,29,13,'2024-11-09','10:00:00','confirmed','หมอนัดมาค่ะ'),
(48,29,3,'2024-11-09','09:00:00','confirmed','หมอนัดให้มา'),
(49,29,2,'2024-11-09','09:00:00','confirmed','หมอนัดให้มาค่ะ'),
(50,29,2,'2024-11-09','10:00:00','confirmed','หมอนัดอีก'),
(51,29,18,'2024-11-09','09:00:00','confirmed','หมอนัดอีกรอบ'),
(52,29,18,'2024-11-09','10:00:00','confirmed','หมอนัดอีกรอบค่ะ'),
(55,29,2,'2024-11-09','11:00:00','pending','หมอนัดใหม่'),
(56,29,18,'2024-11-09','11:00:00','pending','หมอนัดใหม่ค่ะ'),
(57,14,2,'2024-11-08','14:00:00','confirmed','หมอนัดรอบใหม่'),
(58,14,3,'2024-11-09','11:00:00','confirmed','หมอนัด'),
(60,14,2,'2024-11-15','09:00:00','pending','ตรวจเบื้องต้น'),
(61,30,3,'2024-11-21','09:00:00','confirmed','คิดมาก');

/*Table structure for table `assessment` */

DROP TABLE IF EXISTS `assessment`;

CREATE TABLE `assessment` (
  `assessment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `request` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`assessment_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `assessment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `assessment` */

insert  into `assessment`(`assessment_id`,`user_id`,`score`,`created_at`,`request`) values 
(70,14,0,'2024-09-12 13:42:47','no'),
(71,14,3,'2024-09-12 13:48:55','yes'),
(72,17,20,'2024-09-13 06:41:30','yes'),
(73,17,3,'2024-09-13 07:58:36','yes'),
(74,14,12,'2024-09-13 12:11:11','yes'),
(75,19,20,'2024-09-13 12:23:51','yes'),
(76,14,1,'2024-09-17 17:47:36','yes'),
(77,25,22,'2024-10-06 12:42:23','yes'),
(78,14,13,'2024-10-06 13:04:28','yes'),
(79,14,0,'2024-10-22 06:57:35','yes'),
(82,14,0,'2024-10-22 07:15:21','no'),
(88,14,0,'2024-10-22 07:45:36','no'),
(89,29,0,'2024-10-22 22:39:43','no'),
(90,30,21,'2024-10-24 01:36:06','no'),
(91,31,11,'2024-10-24 15:26:07','yes'),
(92,14,16,'2024-10-27 01:23:41','yes'),
(93,14,13,'2024-11-02 14:28:47','no'),
(94,14,5,'2024-11-04 04:26:50','yes');

/*Table structure for table `chat` */

DROP TABLE IF EXISTS `chat`;

CREATE TABLE `chat` (
  `chat_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `message` text,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sender_role` enum('user','doctor') DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`chat_id`),
  KEY `user_id` (`user_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `chat_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `chat` */

insert  into `chat`(`chat_id`,`user_id`,`doctor_id`,`message`,`sent_at`,`sender_role`,`is_read`) values 
(30,14,3,'eiei','2024-10-27 01:20:46','doctor',1),
(31,14,3,'สวัสดี','2024-11-02 14:31:21','doctor',0);

/*Table structure for table `login` */

DROP TABLE IF EXISTS `login`;

CREATE TABLE `login` (
  `login_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `role` enum('user','doctor','admin') NOT NULL,
  PRIMARY KEY (`login_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `login_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `login` */

insert  into `login`(`login_id`,`user_id`,`role`) values 
(1,1,'admin'),
(2,2,'doctor'),
(3,3,'doctor'),
(10,10,'user'),
(13,13,'doctor'),
(14,14,'user'),
(17,17,'user'),
(18,18,'doctor'),
(19,19,'user'),
(21,24,'admin'),
(22,25,'user'),
(26,29,'user'),
(27,30,'user'),
(28,31,'user');

/*Table structure for table `questions` */

DROP TABLE IF EXISTS `questions`;

CREATE TABLE `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `no` int NOT NULL,
  `question_text` varchar(255) NOT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `questions` */

insert  into `questions`(`question_id`,`no`,`question_text`) values 
(1,1,'เบื่อ ทำอะไร ๆ ก็ไม่เพลิดเพลิน'),
(2,2,'ไม่สบายใจ ซึมเศร้า หรือท้อแท้'),
(3,3,' หลับยาก หรือหลับ ๆ ตื่น ๆ หรือหลับมากไป'),
(4,4,' เหนื่อยง่าย หรือไม่ค่อยมีแรง'),
(5,5,'เบื่ออาหาร หรือกินมากเกินไป'),
(6,6,' รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือเป็นคนทำให้ตัวเอง หรือครอบครัวผิดหวัง'),
(7,7,'สมาธิไม่ดีเวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ หรือทำงานที่ต้องใช้ความตั้งใจ'),
(8,8,'พูดหรือทำอะไรช้าจนคนอื่นมองเห็น หรือกระสับกระส่ายจนท่านอยู่ไม่นิ่งเหมือนเคย'),
(10,9,'คิดทำร้ายตนเอง หรือคิดว่าถ้าตาย ๆ ไปเสียคงจะดี');

/*Table structure for table `target_values` */

DROP TABLE IF EXISTS `target_values`;

CREATE TABLE `target_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_user_count` int NOT NULL,
  `target_booking_count` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `target_values` */

insert  into `target_values`(`id`,`target_user_count`,`target_booking_count`) values 
(1,100,100);

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `specialty` varchar(255) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `IDcard` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `user` */

insert  into `user`(`user_id`,`username`,`password`,`name`,`specialty`,`gender`,`phone`,`address`,`IDcard`,`email`) values 
(1,'earn3011','123456','แกมแพร นิติสาขา','แอดมิน','หญิง','0205899820','987 ถนนฉิมพาลี ต.ป่าบัวบาน อ.บ้านเขว้า เลย','5788430929484','kamprae.nitisaka@gmail.com'),
(2,'dew','123456','ภัคชัญญา ผลบุญ','คุณหมอ','ชาย','0852649027','05/68 ถ.ถนอมพลกรัง ต.อุ่มเม่า อ.แก้งคร้อ จ.สระแก้ว','7691637136406','phakchanya.phonbun@gmail.com'),
(3,'das','123456','พิชาภพ สันตะวงศ์','คุณหมอ','ชาย','0789074239','86/25 ถนนนาคพันธุ์ อำเภอเวียงแก่น จังหวัดกระบี่ 79530','8660961223774','phichaphop.santawong@gmail.com'),
(10,'khmsin','b0nrxn','รอกีเย๊าะ โพธิสัตย์',NULL,'ชาย','0278565905','59 ถ.ทวนทอง อ.บึงกุ่ม อุบลราชธานี 35280','8221003338317','rokiye.pothisat@gmail.com'),
(13,'dds','112254','ภูวิช ผลบุญ','คุณหมอ','ชาย','0623849879','444/5 ถ.ธรรมสถิตไพศาล ตำบลบางเล่า อำเภอเรณูนคร เชียงใหม่ 87630','2460100818130','brianwilson3@gmail.com'),
(14,'araya12','123456','อานะ พันสุ',NULL,'หญิง','0452275181','20 หมู่ 0 ถนนทองปากน้ำ ตำบลเขาพระนอน อำเภอหนอกจอก กรุงเทพ 34340','1421679631814','earnny3011@gmail.com'),
(17,'danielreynolds','0000002','ปริญญา แถมธน',NULL,'หญิง','0210017040','48 หมู่ 68 ถนนจ้อยนุแสง ต.หนองแสงใต้ อ.หนองบัวแดง จ.หนองบัวลำภู 45900','4306535085695','danielreynolds@gmail.com'),
(18,'nirun1','11111','นิรันดร์ ศิวะวรเวท','คุณหมอ','หญิง','0504851644','149/25 ถนนแน่นดุจป้อม ต.หนองแสง อ.เทิง ร้อยเอ็ด','4125221169290','eawwa45@gmail.com'),
(19,'titnut2','123456','ฐิติณัฐฐา ถนัดอักษร',NULL,'หญิง','0467154641','354/91 ถ.ทรัพย์สาร ต.ห้วยโคกกรวด อ.เทิง ชลบุรี 13890','5640440630350','kristinsullivan59@gmail.com'),
(21,'aunchin7','123456','อัญชัญ ธัญาโภชน์',NULL,'หญิง','0395034760','02 หมู่ 9 ถนนถนนยะผา แขวงอาสา เขตเขตพญาไท กรุงเทพมหานคร 33760','7302512910590','anthonydelgado91@gmail.com'),
(22,'pwee178','testpass','พรสวรรค์ เตชะกำพุ',NULL,'ชาย','0910063095','8 ถนนถ.ถนัดการเขียน แขวงตลอด เขตเขตบางบอน กรุงเทพมหานคร 47800','4470147605950','stevendavis51@gmail.com'),
(24,'suddu5','newpass','สุทกร ธุวะนุติ์','แอดมินใหม่','ชาย','0910063095','95/48 ถนนถ.ธรรมทินนา แขวงราก เขตเขตบางรัก กรุงเทพมหานคร 62440','9514506536482','dennistrevino50@gmail.com'),
(25,'dee','123456','นพ คณานุรักษ์','','ชาย','0841112254','58/1 ถนนถนนเยาวธนโชค แขวงสุดท้าย เขตเขตบางซื่อ กรุงเทพมหานคร 80850','1495130837517','ww@gmail.com'),
(29,'drrew','123456','ภัคชัญญา ยาสิ',NULL,NULL,'0852649024',NULL,'7691637136409','pha144@gmail.com'),
(30,'reew','123456','ราวิดี สาทิต',NULL,'หญิง','0846989811',NULL,'1144523685441','eeawe@gmail.com'),
(31,'reed','12345678','ทิติ รังสี',NULL,NULL,'0845989855',NULL,'1225455565555','Trru@gmail.com');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

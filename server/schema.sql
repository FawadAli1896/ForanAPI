-- ForanAPI MySQL Schema for Laragon / Production Servers
-- You can import this into phpMyAdmin or run in MySQL

CREATE DATABASE IF NOT EXISTS `foranapi` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `foranapi`;

-- 1. Users Table (Registered desktop app users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_login_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Devices & Telemetry Table (Every machine running the app)
CREATE TABLE IF NOT EXISTS `devices` (
  `machine_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_email` VARCHAR(191) NULL,
  `os` VARCHAR(100) NOT NULL,
  `platform` VARCHAR(50) NOT NULL,
  `app_version` VARCHAR(20) NOT NULL,
  `hostname` VARCHAR(100) NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `is_guest` TINYINT(1) DEFAULT 1,
  `launch_count` INT UNSIGNED DEFAULT 1,
  `first_seen_at` DATETIME NOT NULL,
  `last_seen_at` DATETIME NOT NULL,
  INDEX `idx_user_email` (`user_email`),
  INDEX `idx_last_seen` (`last_seen_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Telemetry Event Logs Table
CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `machine_id` VARCHAR(64) NOT NULL,
  `user_email` VARCHAR(191) NULL,
  `event_type` VARCHAR(50) NOT NULL,
  `details` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  INDEX `idx_event_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

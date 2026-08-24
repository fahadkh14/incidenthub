-- IncidentHub database initialization
-- This file runs automatically on first MySQL container startup (via docker-entrypoint-initdb.d).
-- The database and application user are already created by the MySQL image using
-- MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD environment variables, so this file
-- only needs to guarantee sane defaults. Table creation is handled by the Flask
-- backend (SQLAlchemy) on startup.

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- Ensure the database uses a modern, emoji-safe charset/collation.
ALTER DATABASE `incidenthub` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

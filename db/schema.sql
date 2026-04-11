

CREATE DATABASE IF NOT EXISTS Appliance;
USE Appliance;

CREATE TABLE IF NOT EXISTS users (
    userID    BIGINT       AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50)  NOT NULL,
    lastName  VARCHAR(50)  NOT NULL,
    address   VARCHAR(255),
    mobile    VARCHAR(25),
    email     VARCHAR(255) NOT NULL UNIQUE,
    eircode   VARCHAR(10)
);



CREATE DATABASE IF NOT EXISTS Appliance;
USE Appliance;

ALTER TABLE appliance ADD UNIQUE (serialNumber);

CREATE TABLE IF NOT EXISTS users (
    userID    BIGINT       AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50)  NOT NULL,
    lastName  VARCHAR(50)  NOT NULL,
    address   VARCHAR(255),
    mobile    VARCHAR(25),
    email     VARCHAR(255) NOT NULL UNIQUE,
    eircode   VARCHAR(10)
);


CREATE table if not exists appliance
(
    apllianceID     BIGINT auto_increment PRIMARY KEY,
    applianceType   varchar(100),
    brand           varchar(255),
    modelNumber     varchar(20),
    serialNumber    varchar(20),
    purchaseDate    date,
    warrantyExpDate date,
    cost            decimal(6, 2)
);

alter table appliance rename COLUMN apllianceID to applianceID;

ALTER TABLE appliance
    ADD COLUMN userID BIGINT NOT NULL,
    ADD CONSTRAINT fk_appliance_user
        FOREIGN KEY (userID) REFERENCES users(userID)
            ON DELETE CASCADE;





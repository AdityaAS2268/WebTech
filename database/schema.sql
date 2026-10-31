CREATE DATABASE my_database;

USE my_database;

drop table UserAddresses;

CREATE TABLE UserAddresses (
       id INT AUTO_INCREMENT PRIMARY KEY,
       userID varchar(20) NOT NULL,
       AddressLabel varchar(50) NOT NULL,
       Name VARCHAR(100) NOT NULL,
       PhoneNo varchar(10) NOT NULL,
       PinCode varchar(6) NOT NULL,
       AddressLine1 varchar(100) NOT NULL,
       AddressLine2 varchar(100),
       City varchar(100) NOT NULL,
       State varchar(100) NOT NULL,
       IsDefault char(1) NOT NULL default "N"
);

INSERT INTO UserAddresses (
    userId,
    AddressLabel,
    Name,
    PhoneNo,
    PinCode,
    AddressLine1,
    AddressLine2,
    City,
    State
) VALUES (
     'USR1001',
     'Home',
     'Rahul Sharma',
     '9876543210',
     '600001',
     'Flat 4B, Green Valley Apartments',
     'Anna Salai',
     'Chennai',
     'Tamil Nadu'
 );

INSERT INTO UserAddresses (
    userId,
    AddressLabel,
    Name,
    PhoneNo,
    PinCode,
    AddressLine1,
    AddressLine2,
    City,
    State
) VALUES (
 'USR1001',
 'Work',
 'ABCD',
 '9876543210',
 '600001',
 'Flat 4B, Green Valley Apartments',
 'Anna Salai',
 'Chennai',
 'Tamil Nadu'
);

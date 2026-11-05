-- ShopSphere Database Schema
-- Online Marketplace Application

CREATE DATABASE IF NOT EXISTS marketplace_db;
USE marketplace_db;

-- 1. Users Table (Customer, Seller, Admin, Super Admin)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    role ENUM('Customer', 'Seller', 'Admin', 'Super Admin') NOT NULL DEFAULT 'Customer',
    status ENUM('Active', 'Blocked', 'Pending') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Addresses Table (Module: User Profile & Addresses)
CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. UserAddresses Table (Checkout & Delivery Module)
CREATE TABLE IF NOT EXISTS UserAddresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID varchar(20) NOT NULL,
    AddressLabel varchar(50) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    PhoneNo varchar(15) NOT NULL,
    PinCode varchar(10) NOT NULL,
    AddressLine1 varchar(150) NOT NULL,
    AddressLine2 varchar(150),
    City varchar(100) NOT NULL,
    State varchar(100) NOT NULL,
    IsDefault char(1) NOT NULL DEFAULT 'N'
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    subtotal_cents INT NOT NULL,
    delivery_fee_cents INT DEFAULT 0,
    tax_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price_cents INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(64) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    amount_cents INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    card_last_four VARCHAR(4),
    card_brand VARCHAR(30),
    upi_id VARCHAR(100),
    bank_name VARCHAR(100),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'completed',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Sample Seed Data for Testing Profile & Addresses
INSERT INTO users (user_id, name, email, password, mobile, role, status) VALUES
(1, 'Jane Doe', 'jane.doe@university.edu', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9876543210', 'Customer', 'Active'),
(2, 'John Seller', 'john.seller@marketplace.com', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9812345678', 'Seller', 'Active'),
(3, 'Sys Admin', 'admin@marketplace.com', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9898989898', 'Admin', 'Active')
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO addresses (address_id, user_id, address_line, city, state, pincode) VALUES
(1, 1, 'Hostel Block 4, Room 210, Tech Campus', 'Bengaluru', 'Karnataka', '560001'),
(2, 1, 'Flat 302, Green Valley Apts', 'Mysuru', 'Karnataka', '570001')
ON DUPLICATE KEY UPDATE address_id=address_id;

INSERT INTO UserAddresses (userID, AddressLabel, Name, PhoneNo, PinCode, AddressLine1, AddressLine2, City, State, IsDefault) VALUES
('USR1001', 'Home', 'Rahul Sharma', '9876543210', '600001', 'Flat 4B, Green Valley Apartments', 'Anna Salai', 'Chennai', 'Tamil Nadu', 'Y'),
('USR1001', 'Work', 'Rahul Sharma', '9876543210', '600001', 'Tech Park, Block B', 'OMR Road', 'Chennai', 'Tamil Nadu', 'N')
ON DUPLICATE KEY UPDATE id=id;

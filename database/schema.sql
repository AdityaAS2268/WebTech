-- ShopSphere Database Schema
-- Local SQL Schema for Orders & Payments Module

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER,
    subtotal_cents INTEGER NOT NULL,
    delivery_fee_cents INTEGER DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price_cents INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_reference VARCHAR(64) UNIQUE NOT NULL,
    order_id INTEGER NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'card', 'upi', 'netbanking'
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    card_last_four VARCHAR(4),
    card_brand VARCHAR(30),
    upi_id VARCHAR(100),
    bank_name VARCHAR(100),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'completed', -- 'initiated', 'completed', 'failed', 'refunded'
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
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

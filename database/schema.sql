-- Database schema for Online Marketplace
-- Module: User Profile & Addresses

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

CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Sample Seed Data for testing
INSERT INTO users (user_id, name, email, password, mobile, role, status) VALUES
(1, 'Jane Doe', 'jane.doe@university.edu', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9876543210', 'Customer', 'Active'),
(2, 'John Seller', 'john.seller@marketplace.com', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9812345678', 'Seller', 'Active'),
(3, 'Sys Admin', 'admin@marketplace.com', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9898989898', 'Admin', 'Active')
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO addresses (address_id, user_id, address_line, city, state, pincode) VALUES
(1, 1, 'Hostel Block 4, Room 210, Tech Campus', 'Bengaluru', 'Karnataka', '560001'),
(2, 1, 'Flat 302, Green Valley Apts', 'Mysuru', 'Karnataka', '570001')
ON DUPLICATE KEY UPDATE address_id=address_id;

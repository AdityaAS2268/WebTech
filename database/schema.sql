-- ShopSphere Database Schema
-- Unified MySQL Schema for Products, Orders, Payments, Users & Addresses

CREATE DATABASE IF NOT EXISTS my_database;
USE my_database;

-- 1. Users Table (Customer, Seller, Admin, Super Admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT GENERATED ALWAYS AS (id) VIRTUAL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K',
    mobile VARCHAR(20) DEFAULT '9876543210',
    phone VARCHAR(20) DEFAULT '9876543210',
    role ENUM('Customer', 'Seller', 'Admin', 'Super Admin') NOT NULL DEFAULT 'Customer',
    status ENUM('Active', 'Blocked', 'Pending') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Addresses Table (User Profile Module: 1:N with users)
CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. UserAddresses Table (Delivery & Checkout Module)
DROP TABLE IF EXISTS UserAddresses;

CREATE TABLE UserAddresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID VARCHAR(20) NOT NULL,
    AddressLabel VARCHAR(50) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    PhoneNo VARCHAR(20) NOT NULL,
    PinCode VARCHAR(10) NOT NULL,
    AddressLine1 VARCHAR(100) NOT NULL,
    AddressLine2 VARCHAR(100),
    City VARCHAR(100) NOT NULL,
    State VARCHAR(100) NOT NULL,
    IsDefault CHAR(1) NOT NULL DEFAULT 'N'
);

INSERT INTO UserAddresses (
    userID, AddressLabel, Name, PhoneNo, PinCode, AddressLine1, AddressLine2, City, State, IsDefault
) VALUES (
    'USR1001', 'Home', 'Jane Doe', '+91 98765 43210', '560001',
    'Hostel Block 4, Room 210', 'Tech Campus', 'Bengaluru', 'Karnataka', 'Y'
), (
    'USR1001', 'Residence', 'Jane Doe', '+91 98765 43210', '570001',
    'Flat 302, Green Valley Apartments', 'Jayalakshmipuram', 'Mysuru', 'Karnataka', 'N'
);

-- 4. Products Table (Catalog Module)
CREATE TABLE IF NOT EXISTS Products (
    id VARCHAR(100) PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    rating_stars DECIMAL(2,1),
    rating_count INT,
    price_cents INT NOT NULL,
    keywords JSON,
    type VARCHAR(50),
    size_chart_link VARCHAR(255)
);

INSERT INTO Products (
    id, image, name, rating_stars, rating_count,
    price_cents, keywords, type, size_chart_link
) VALUES
('e43638ce-6aa0-4b85-b27f-e1d07eb678c6', 'images/products/athletic-cotton-socks-6-pairs.jpg', 'Black and Gray Athletic Cotton Socks - 6 Pairs', 4.5, 87, 1090, '["socks", "sports", "apparel"]', NULL, NULL),
('15b6fc6f-327a-4ec4-896f-486349e85a3d', 'images/products/intermediate-composite-basketball.jpg', 'Intermediate Size Basketball', 4, 127, 2095, '["sports", "basketballs"]', NULL, NULL),
('83d4ca15-0f35-48f5-b7a3-1ea210004f2e', 'images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg', 'Adults Plain Cotton T-Shirt - 2 Pack', 4.5, 56, 799, '["tshirts", "apparel", "mens"]', 'clothing', 'images/clothing-size-chart.png'),
('54e0eccd-8f36-462b-b68a-8182611d9add', 'images/products/black-2-slot-toaster.jpg', '2 Slot Toaster - Black', 5, 2197, 1899, '["toaster", "kitchen", "appliances"]', NULL, NULL),
('3ebe75dc-64d2-4137-8860-1f5a963e534b', 'images/products/6-piece-white-dinner-plate-set.jpg', '6 Piece White Dinner Plate Set', 4, 37, 2067, '["plates", "kitchen", "dining"]', NULL, NULL),
('8c9c52b5-5a19-4bcb-a5d1-158a74287c53', 'images/products/6-piece-non-stick-baking-set.webp', '6-Piece Nonstick, Carbon Steel Oven Bakeware Baking Set', 4.5, 175, 3499, '["kitchen", "cookware"]', NULL, NULL),
('dd82ca78-a18b-4e2a-9250-31e67412f98d', 'images/products/plain-hooded-fleece-sweatshirt-yellow.jpg', 'Plain Hooded Fleece Sweatshirt', 4.5, 317, 2400, '["hoodies", "sweaters", "apparel"]', NULL, NULL),
('77919bbe-0e56-475b-adde-4f24dfed3a04', 'images/products/luxury-tower-set-6-piece.jpg', 'Luxury Towel Set - Graphite Gray', 4.5, 144, 3599, '["bathroom", "washroom", "restroom", "towels", "bath towels"]', NULL, NULL),
('3fdfe8d6-9a15-4979-b459-585b0d0545b9', 'images/products/liquid-laundry-detergent-plain.jpg', 'Liquid Laundry Detergent, 110 Loads, 82.5 Fl Oz', 4.5, 305, 2899, '["bathroom", "cleaning"]', NULL, NULL),
('58b4fc92-e98c-42aa-8c55-b6b79996769a', 'images/products/knit-athletic-sneakers-gray.jpg', 'Waterproof Knit Athletic Sneakers - Gray', 4, 89, 3390, '["shoes", "running shoes", "footwear"]', NULL, NULL),
('5968897c-4d27-4872-89f6-5bcb052746d7', 'images/products/women-chiffon-beachwear-coverup-black.jpg', 'Women''s Chiffon Beachwear Cover Up - Black', 4.5, 235, 2070, '["robe", "swimsuit", "swimming", "bathing", "apparel"]', 'clothing', 'images/clothing-size-chart.png'),
('aad29d11-ea98-41ee-9285-b916638cac4a', 'images/products/round-sunglasses-black.jpg', 'Round Sunglasses', 4.5, 30, 1560, '["accessories", "shades"]', NULL, NULL),
('04701903-bc79-49c6-bc11-1af7e3651358', 'images/products/women-beach-sandals.jpg', 'Women''s Two Strap Buckle Sandals - Tan', 4.5, 562, 2499, '["footwear", "sandals", "womens", "beach", "summer"]', NULL, NULL),
('901eb2ca-386d-432e-82f0-6fb1ee7bf969', 'images/products/blackout-curtain-set-beige.webp', 'Blackout Curtains Set 4-Pack - Beige', 4.5, 232, 4599, '["bedroom", "curtains", "home"]', NULL, NULL),
('82bb68d7-ebc9-476a-989c-c78a40ee5cd9', 'images/products/men-slim-fit-summer-shorts-gray.jpg', 'Men''s Slim-Fit Summer Shorts', 4, 160, 1699, '["shorts", "apparel", "mens"]', NULL, NULL),
('c2a82c5e-aff4-435f-9975-517cfaba2ece', 'images/products/electric-glass-and-steel-hot-water-kettle.webp', 'Electric Glass and Steel Hot Tea Water Kettle - 1.7-Liter', 5, 846, 3074, '["water boiler", "appliances", "kitchen"]', NULL, NULL),
('6b07d4e7-f540-454e-8a1e-363f25dbae7d', 'images/products/facial-tissue-2-ply-18-boxes.jpg', 'Ultra Soft Tissue 2-Ply - 18 Box', 4, 99, 2374, '["kleenex", "tissues", "kitchen", "tissues box", "napkins"]', NULL, NULL),
('a82c6bac-3067-4e68-a5ba-d827ac0be010', 'images/products/straw-sunhat.webp', 'Straw Lifeguard Sun Hat', 4, 215, 2200, '["hats", "straw hats", "summer", "apparel"]', NULL, NULL),
('e4f64a65-1377-42bc-89a5-e572d19252e2', 'images/products/sky-flower-stud-earrings.webp', 'Sterling Silver Sky Flower Stud Earrings', 4.5, 52, 1799, '["jewelry", "accessories", "womens"]', NULL, NULL),
('b0f17cc5-8b40-4ca5-9142-b61fe3d98c85', 'images/products/women-stretch-popover-hoodie-black.jpg', 'Women''s Stretch Popover Hoodie', 4.5, 2465, 1374, '["hooded", "hoodies", "sweaters", "womens", "apparel"]', 'clothing', 'images/clothing-size-chart.png'),
('a93a101d-79ef-4cf3-a6cf-6dbe532a1b4a', 'images/products/bathroom-rug.jpg', 'Bathroom Bath Rug Mat 20 x 31 Inch - Grey', 4.5, 119, 1250, '["bathmat", "bathroom", "home"]', NULL, NULL),
('4f4fbcc2-4e72-45cc-935c-9e13d79cc57f', 'images/products/women-knit-ballet-flat-black.jpg', 'Women''s Knit Ballet Flat', 4, 326, 2640, '["shoes", "flats", "womens", "footwear"]', NULL, NULL),
('8b5a2ee1-6055-422a-a666-b34ba28b76d4', 'images/products/men-golf-polo-t-shirt-blue.jpg', 'Men''s Regular-Fit Quick-Dry Golf Polo Shirt', 4.5, 2556, 1599, '["tshirts", "shirts", "apparel", "mens"]', 'clothing', 'images/clothing-size-chart.png'),
('b86ddc8b-3501-4b17-9889-a3bad6fb585f', 'images/products/trash-can-with-foot-pedal-50-liter.jpg', 'Trash Can with Foot Pedal - Brushed Stainless Steel', 4.5, 2286, 8300, '["garbage", "bins", "cans", "kitchen"]', NULL, NULL),
('19c6a64a-5463-4d45-9af8-e41140a4100c', 'images/products/duvet-cover-set-blue-twin.jpg', 'Duvet Cover Set with Zipper Closure', 4, 456, 2399, '["bedroom", "bed sheets", "sheets", "covers", "home"]', NULL, NULL),
('d2785924-743d-49b3-8f03-ec258e640503', 'images/products/women-chunky-beanie-gray.webp', 'Women''s Chunky Cable Beanie - Gray', 5, 83, 1250, '["hats", "winter hats", "beanies", "tuques", "apparel", "womens"]', NULL, NULL),
('ee1f7c56-f977-40a4-9642-12ba5072e2b0', 'images/products/men-chino-pants-beige.jpg', 'Men''s Classic-fit Pleated Chino Pants', 4.5, 9017, 2290, '["pants", "apparel", "mens"]', NULL, NULL),
('1c079479-8586-494f-ab53-219325432536', 'images/products/men-athletic-shoes-green.jpg', 'Men''s Athletic Sneaker', 4, 229, 3890, '["shoes", "running shoes", "footwear", "mens"]', NULL, NULL),
('4df68c27-fd59-4a6a-bbd1-e754ddb6d53c', 'images/products/men-navigator-sunglasses-brown.jpg', 'Men''s Navigator Sunglasses Pilot', 3.5, 42, 1690, '["sunglasses", "glasses", "accessories", "shades"]', NULL, NULL),
('4e37dd03-3b23-4bc6-9ff8-44e112a92c64', 'images/products/non-stick-cooking-set-15-pieces.webp', 'Non-Stick Cookware Set, Pots, Pans and Utensils - 15 Pieces', 4.5, 511, 6797, '["cooking set", "kitchen"]', NULL, NULL),
('a434b69f-1bc1-482d-9ce7-cd7f4a66ce8d', 'images/products/vanity-mirror-silver.jpg', 'Vanity Mirror with Heavy Base - Chrome', 4.5, 130, 1649, '["bathroom", "washroom", "mirrors", "home"]', NULL, NULL),
('a45cfa0a-66d6-4dc7-9475-e2b01595f7d7', 'images/products/women-french-terry-fleece-jogger-camo.jpg', 'Women''s Fleece Jogger Sweatpant', 4.5, 248, 2400, '["pants", "sweatpants", "jogging", "apparel", "womens"]', NULL, NULL),
('d339adf3-e004-4c20-a120-40e8874c66cb', 'images/products/double-elongated-twist-french-wire-earrings.webp', 'Double Oval Twist French Wire Earrings - Gold', 4.5, 117, 2400, '["accessories", "womens"]', NULL, NULL),
('d37a651a-d501-483b-aae6-a9659b0757a0', 'images/products/round-airtight-food-storage-containers.jpg', 'Round Airtight Food Storage Containers - 5 Piece', 4, 126, 2899, '["boxes", "food containers", "kitchen"]', NULL, NULL),
('0d7f9afa-2efe-4fd9-b0fd-ba5663e0a524', 'images/products/coffeemaker-with-glass-carafe-black.jpg', 'Coffeemaker with Glass Carafe and Reusable Filter - 25 Oz, Black', 4.5, 1211, 2250, '["coffeemakers", "kitchen", "appliances"]', NULL, NULL),
('02e3a47e-dd68-467e-9f71-8bf6f723fdae', 'images/products/blackout-curtains-black.jpg', 'Blackout Curtains Set 42 x 84-Inch - Black, 2 Panels', 4.5, 363, 3099, '["bedroom", "home"]', NULL, NULL),
('8a53b080-6d40-4a65-ab26-b24ecf700bce', 'images/products/cotton-bath-towels-teal.webp', '100% Cotton Bath Towels - 2 Pack, Light Teal', 4.5, 93, 2110, '["bathroom", "home", "towels"]', NULL, NULL),
('10ed8504-57db-433c-b0a3-fc71a35c88a1', 'images/products/knit-athletic-sneakers-pink.webp', 'Waterproof Knit Athletic Sneakers - Pink', 4, 89, 3390, '["shoes", "running shoes", "footwear", "womens"]', NULL, NULL),
('77a845b1-16ed-4eac-bdf9-5b591882113d', 'images/products/countertop-blender-64-oz.jpg', 'Countertop Blender - 64oz, 1400 Watts', 4, 3, 10747, '["food blenders", "kitchen", "appliances"]', NULL, NULL),
('36c64692-677f-4f58-b5ec-0dc2cf109e27', 'images/products/floral-mixing-bowl-set.jpg', '10-Piece Mixing Bowl Set with Lids - Floral', 5, 679, 3899, '["mixing bowls", "baking", "cookware", "kitchen"]', NULL, NULL),
('aaa65ef3-8d6f-4eb3-bc9b-a6ea49047d8f', 'images/products/kitchen-paper-towels-30-pack.jpg', '2-Ply Kitchen Paper Towels - 30 Pack', 4.5, 1045, 5799, '["kitchen", "kitchen towels", "tissues"]', NULL, NULL),
('bc2847e9-5323-403f-b7cf-57fde044a955', 'images/products/men-cozy-fleece-zip-up-hoodie-red.jpg', 'Men''s Full-Zip Hooded Fleece Sweatshirt', 4.5, 3157, 2400, '["sweaters", "hoodies", "apparel", "mens"]', NULL, NULL)
ON DUPLICATE KEY UPDATE id=id;

-- 5. Orders Table
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
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Order Items Table
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

-- 7. Payments Table
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

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- 8. Sample Seed Data for Users & Addresses
INSERT INTO users (id, name, email, password, mobile, role, status) VALUES
(1, 'Jane Doe', 'jane.doe@university.edu', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9876543210', 'Customer', 'Active'),
(2, 'John Seller', 'john.seller@marketplace.com', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9812345678', 'Seller', 'Active'),
(3, 'Sys Admin', 'admin@marketplace.com', '$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K', '9898989898', 'Admin', 'Active')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO addresses (address_id, user_id, address_line, city, state, pincode) VALUES
(1, 1, 'Hostel Block 4, Room 210, Tech Campus', 'Bengaluru', 'Karnataka', '560001'),
(2, 1, 'Flat 302, Green Valley Apts', 'Mysuru', 'Karnataka', '570001')
ON DUPLICATE KEY UPDATE address_id=address_id;

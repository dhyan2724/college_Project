-- MySQL Database Schema for Lab Inventory Management System

-- Create database
CREATE DATABASE IF NOT EXISTS lab_inventory;
USE lab_inventory;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('master_admin', 'admin', 'faculty', 'student', 'phd_scholar', 'dissertation_student') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    rollNo VARCHAR(255) UNIQUE,
    category ENUM('UG/PG', 'PhD', 'Project Student'),
    lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rollno (rollNo),
    INDEX idx_role (role)
);

-- Chemicals table
CREATE TABLE IF NOT EXISTS chemicals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Solid', 'Liquid', 'Stain') NOT NULL,
    storagePlace ENUM('Cupboard', 'Freezer', 'Deep Freezer') NOT NULL,
    totalWeight DECIMAL(10,2) NOT NULL,
    availableWeight DECIMAL(10,2) NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    chemicalId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catalog (catalogNumber),
    INDEX idx_chemicalId (chemicalId)
);

-- Glasswares table
CREATE TABLE IF NOT EXISTS glasswares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    glasswareId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catalog (catalogNumber),
    INDEX idx_glasswareId (glasswareId)
);

-- Plasticwares table
CREATE TABLE IF NOT EXISTS plasticwares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    plasticwareId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catalog (catalogNumber),
    INDEX idx_plasticwareId (plasticwareId)
);

-- Instruments table
CREATE TABLE IF NOT EXISTS instruments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    instrumentId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catalog (catalogNumber),
    INDEX idx_instrumentId (instrumentId)
);

-- Miscellaneous table
CREATE TABLE IF NOT EXISTS miscellaneous (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    description TEXT,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    miscellaneousId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catalog (catalogNumber),
    INDEX idx_miscellaneousId (miscellaneousId)
);


-- Pending Requests table
CREATE TABLE IF NOT EXISTS pending_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facultyInChargeId INT NOT NULL,
    requestedByUserId INT NOT NULL,
    requestedByName VARCHAR(255),
    requestedByRole VARCHAR(255),
    requestedByRollNo VARCHAR(255),
    requestedByCollegeEmail VARCHAR(255),
    purpose TEXT,
    desiredIssueTime DATETIME,
    desiredReturnTime DATETIME,
    requestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facultyInChargeId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requestedByUserId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_requestDate (requestDate)
);

-- Pending Request Items table (for the items in each request)
CREATE TABLE IF NOT EXISTS pending_request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pendingRequestId INT NOT NULL,
    itemType ENUM('Chemical', 'Glassware', 'Plasticware', 'Instrument') NOT NULL,
    itemId INT NOT NULL,
    quantity INT,
    totalWeightRequested DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pendingRequestId) REFERENCES pending_requests(id) ON DELETE CASCADE,
    INDEX idx_itemType (itemType),
    INDEX idx_itemId (itemId)
);

-- Issued Items table
CREATE TABLE IF NOT EXISTS issued_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemType ENUM('Chemical', 'Glassware', 'Plasticware', 'Instrument') NOT NULL,
    itemId INT NOT NULL,
    issuedToId INT NOT NULL,
    issuedByUserId INT NOT NULL,
    issuedByName VARCHAR(255),
    issuedByRole VARCHAR(255),
    issuedByRollNo VARCHAR(255),
    facultyInCharge VARCHAR(255),
    quantity INT,
    totalWeightIssued DECIMAL(10,2),
    purpose TEXT,
    issueDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returnDate DATETIME,
    status ENUM('issued', 'returned') DEFAULT 'issued',
    notes TEXT,
    pendingRequestId INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (issuedToId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issuedByUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pendingRequestId) REFERENCES pending_requests(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_issueDate (issueDate),
    INDEX idx_itemType (itemType)
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    itemType VARCHAR(255) NOT NULL,
    itemId INT,
    itemName VARCHAR(255),
    user VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_itemType (itemType),
    INDEX idx_timestamp (timestamp)
);

-- Lab Registers table
CREATE TABLE IF NOT EXISTS lab_registers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registerType ENUM(
        'ChemicalItemIssued',
        'GlasswareItemIssued',
        'PlasticwareItemIssued',
        'InstrumentUsed',
        'BreakageCharges',
        'DailyEntry',
        'AnimalCultureLab',
        'PlantCultureLab'
    ) NOT NULL,
    labType ENUM('Common', 'Research') NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    day VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    facultyInCharge VARCHAR(255),
    item VARCHAR(255),
    totalWeight DECIMAL(10,2),
    purpose TEXT,
    inTime VARCHAR(255),
    outTime VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_registerType (registerType),
    INDEX idx_date (date)
);

-- FAQ table
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);


-- Specimens table
CREATE TABLE IF NOT EXISTS specimens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    specimenId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catalog (catalogNumber),
    INDEX idx_specimenId (specimenId)
);

-- Slides table
CREATE TABLE IF NOT EXISTS slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    slideId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_catalog (catalogNumber),
    INDEX idx_slideId (slideId)
);
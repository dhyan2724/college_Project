-- PostgreSQL Database Schema for Lab Inventory Management System (Supabase)
-- This schema is compatible with Supabase/PostgreSQL

-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('master_admin', 'admin', 'faculty', 'student', 'phd_scholar', 'dissertation_student')),
    email VARCHAR(255) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    rollNo VARCHAR(255) UNIQUE,
    category VARCHAR(50) CHECK (category IN ('UG/PG', 'PhD', 'Project Student')),
    lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    year VARCHAR(20),
    department VARCHAR(100)
);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_rollno ON users(rollNo);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Chemicals table
CREATE TABLE IF NOT EXISTS chemicals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Solid', 'Liquid', 'Stain')),
    storagePlace VARCHAR(50) NOT NULL CHECK (storagePlace IN ('Cupboard', 'Freezer', 'Deep Freezer')),
    totalWeight DECIMAL(10,2) NOT NULL,
    availableWeight DECIMAL(10,2) NOT NULL,
    company VARCHAR(255),
    catalogNumber VARCHAR(255) NOT NULL UNIQUE,
    chemicalId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for chemicals
CREATE INDEX IF NOT EXISTS idx_chemicals_catalog ON chemicals(catalogNumber);
CREATE INDEX IF NOT EXISTS idx_chemicals_chemicalId ON chemicals(chemicalId);

-- Glasswares table
CREATE TABLE IF NOT EXISTS glasswares (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    glasswareId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for glasswares
CREATE INDEX IF NOT EXISTS idx_glasswares_glasswareId ON glasswares(glasswareId);

-- Plasticwares table
CREATE TABLE IF NOT EXISTS plasticwares (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    plasticwareId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for plasticwares
CREATE INDEX IF NOT EXISTS idx_plasticwares_plasticwareId ON plasticwares(plasticwareId);

-- Instruments table
CREATE TABLE IF NOT EXISTS instruments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    instrumentId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for instruments
CREATE INDEX IF NOT EXISTS idx_instruments_instrumentId ON instruments(instrumentId);

-- Miscellaneous table
CREATE TABLE IF NOT EXISTS miscellaneous (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    description TEXT,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    miscellaneousId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for miscellaneous
CREATE INDEX IF NOT EXISTS idx_miscellaneous_miscellaneousId ON miscellaneous(miscellaneousId);

-- Pending Requests table
CREATE TABLE IF NOT EXISTS pending_requests (
    id SERIAL PRIMARY KEY,
    facultyInChargeId INT NOT NULL,
    requestedByUserId INT NOT NULL,
    requestedByName VARCHAR(255),
    requestedByRole VARCHAR(255),
    requestedByRollNo VARCHAR(255),
    requestedByCollegeEmail VARCHAR(255),
    purpose TEXT,
    desiredIssueTime TIMESTAMP,
    desiredReturnTime TIMESTAMP,
    requestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facultyInChargeId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requestedByUserId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for pending_requests
CREATE INDEX IF NOT EXISTS idx_pending_requests_status ON pending_requests(status);
CREATE INDEX IF NOT EXISTS idx_pending_requests_requestDate ON pending_requests(requestDate);

-- Pending Request Items table
CREATE TABLE IF NOT EXISTS pending_request_items (
    id SERIAL PRIMARY KEY,
    pendingRequestId INT NOT NULL,
    itemType VARCHAR(50) NOT NULL CHECK (itemType IN ('Chemical', 'Glassware', 'Plasticware', 'Instrument')),
    itemId INT NOT NULL,
    quantity INT,
    totalWeightRequested DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pendingRequestId) REFERENCES pending_requests(id) ON DELETE CASCADE
);

-- Create indexes for pending_request_items
CREATE INDEX IF NOT EXISTS idx_pending_request_items_itemType ON pending_request_items(itemType);
CREATE INDEX IF NOT EXISTS idx_pending_request_items_itemId ON pending_request_items(itemId);

-- Issued Items table
CREATE TABLE IF NOT EXISTS issued_items (
    id SERIAL PRIMARY KEY,
    itemType VARCHAR(50) NOT NULL CHECK (itemType IN ('Chemical', 'Glassware', 'Plasticware', 'Instrument')),
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
    returnDate TIMESTAMP,
    status VARCHAR(50) DEFAULT 'issued' CHECK (status IN ('issued', 'returned')),
    notes TEXT,
    pendingRequestId INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issuedToId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issuedByUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pendingRequestId) REFERENCES pending_requests(id) ON DELETE SET NULL
);

-- Create indexes for issued_items
CREATE INDEX IF NOT EXISTS idx_issued_items_status ON issued_items(status);
CREATE INDEX IF NOT EXISTS idx_issued_items_issueDate ON issued_items(issueDate);
CREATE INDEX IF NOT EXISTS idx_issued_items_itemType ON issued_items(itemType);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    itemType VARCHAR(255) NOT NULL,
    itemId INT,
    itemName VARCHAR(255),
    "user" VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_itemType ON activity_logs(itemType);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

-- Lab Registers table
CREATE TABLE IF NOT EXISTS lab_registers (
    id SERIAL PRIMARY KEY,
    registerType VARCHAR(50) NOT NULL CHECK (registerType IN (
        'ChemicalItemIssued',
        'GlasswareItemIssued',
        'PlasticwareItemIssued',
        'InstrumentUsed',
        'BreakageCharges',
        'DailyEntry',
        'AnimalCultureLab',
        'PlantCultureLab'
    )),
    labType VARCHAR(50) NOT NULL CHECK (labType IN ('Common', 'Research')),
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for lab_registers
CREATE INDEX IF NOT EXISTS idx_lab_registers_registerType ON lab_registers(registerType);
CREATE INDEX IF NOT EXISTS idx_lab_registers_date ON lab_registers(date);

-- FAQ table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faqs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- Specimens table
CREATE TABLE IF NOT EXISTS specimens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    specimenId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for specimens
CREATE INDEX IF NOT EXISTS idx_specimens_specimenId ON specimens(specimenId);

-- Slides table
CREATE TABLE IF NOT EXISTS slides (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    storagePlace VARCHAR(255) NOT NULL,
    totalQuantity INT NOT NULL,
    availableQuantity INT NOT NULL,
    company VARCHAR(255),
    slideId VARCHAR(255) NOT NULL UNIQUE,
    dateOfEntry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for slides
CREATE INDEX IF NOT EXISTS idx_slides_slideId ON slides(slideId);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chemicals_updated_at BEFORE UPDATE ON chemicals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_glasswares_updated_at BEFORE UPDATE ON glasswares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plasticwares_updated_at BEFORE UPDATE ON plasticwares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instruments_updated_at BEFORE UPDATE ON instruments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_miscellaneous_updated_at BEFORE UPDATE ON miscellaneous
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_requests_updated_at BEFORE UPDATE ON pending_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issued_items_updated_at BEFORE UPDATE ON issued_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_registers_updated_at BEFORE UPDATE ON lab_registers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specimens_updated_at BEFORE UPDATE ON specimens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

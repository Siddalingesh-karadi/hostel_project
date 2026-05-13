-- HostelHub Database Schema
CREATE DATABASE IF NOT EXISTS hostelhub;
USE hostelhub;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student', 'warden') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table (Updated in Step 3)
CREATE TABLE IF NOT EXISTS students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course VARCHAR(100),
    branch VARCHAR(100),
    year INT,
    phone VARCHAR(15),
    blood_group VARCHAR(5),
    address TEXT,
    room_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Rooms Table (Updated in Phase 5)
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    block VARCHAR(10),
    floor INT,
    capacity INT DEFAULT 3,
    occupied INT DEFAULT 0,
    status ENUM('available', 'full', 'maintenance') DEFAULT 'available'
);

-- 4. Complaints Table (Updated in Phase 6)
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('electrical', 'plumbing', 'cleaning', 'internet', 'other') DEFAULT 'other',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'in-progress', 'resolved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 5. Fees Table (Updated in Phase 7)
CREATE TABLE IF NOT EXISTS fees (
    fee_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('paid', 'unpaid', 'partial') DEFAULT 'unpaid',
    payment_date TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 6. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    leave_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    reason TEXT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Link students to rooms correctly
ALTER TABLE students ADD FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL;

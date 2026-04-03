-- Montessori LMS Database Schema
-- Run this script to create all required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id INT NOT NULL,
  unit VARCHAR(50),
  thumbnail_url VARCHAR(500),
  file_count INT DEFAULT 0,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Course Materials table
CREATE TABLE IF NOT EXISTS course_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('document', 'video', 'link', 'assignment') NOT NULL,
  url VARCHAR(500),
  content TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  status ENUM('pending', 'active', 'completed', 'dropped') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  progress INT DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  UNIQUE KEY unique_enrollment (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Lessons/Sessions table
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  meeting_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@montessori.edu', '$2b$10$rQZ9QjQ8YlQjQ8YlQjQ8YeQjQ8YlQjQ8YlQjQ8YlQjQ8YlQjQ8YlQ', 'System Admin', 'admin')
ON DUPLICATE KEY UPDATE name = 'System Admin';

-- Insert sample instructor
INSERT INTO users (email, password_hash, name, role) VALUES
('instructor@montessori.edu', '$2b$10$rQZ9QjQ8YlQjQ8YlQjQ8YeQjQ8YlQjQ8YlQjQ8YlQjQ8YlQjQ8YlQ', 'Maria Montessori', 'instructor')
ON DUPLICATE KEY UPDATE name = 'Maria Montessori';

-- Insert sample courses
INSERT INTO courses (title, description, instructor_id, unit, file_count, status) VALUES
('English - UNIT III', 'Advanced English communication and writing skills for Montessori learners.', 2, 'UNIT III', 10, 'published'),
('English - UNIT II', 'Intermediate English focusing on grammar and vocabulary building.', 2, 'UNIT II', 12, 'published'),
('Mathematics - UNIT I', 'Introduction to mathematical concepts using Montessori methods.', 2, 'UNIT I', 18, 'published')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Insert sample lessons
INSERT INTO lessons (course_id, title, scheduled_at, duration_minutes) VALUES
(1, 'Bernard Carr - A1', '2022-07-12 10:00:00', 60),
(1, 'Henry Poole - A1', '2022-07-17 14:00:00', 60),
(2, 'Helena Lowe - A1', '2022-07-22 09:00:00', 60)
ON DUPLICATE KEY UPDATE title = VALUES(title);

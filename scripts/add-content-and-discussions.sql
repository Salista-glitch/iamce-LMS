-- Migration: Add content management and discussion features
-- Run this script after create-tables.sql

-- Add columns to course_materials for tracking uploads
ALTER TABLE course_materials
ADD COLUMN IF NOT EXISTS uploaded_by INT NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD FOREIGN KEY (uploaded_by) REFERENCES users(id);

-- Course discussions table for real-time chat
CREATE TABLE IF NOT EXISTS course_discussions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for faster discussion queries
CREATE INDEX IF NOT EXISTS idx_discussions_course ON course_discussions(course_id, created_at);
CREATE INDEX IF NOT EXISTS idx_materials_course ON course_materials(course_id, is_active);

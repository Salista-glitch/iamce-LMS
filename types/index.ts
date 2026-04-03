// User types
export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

// Course types
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: number;
  title: string;
  description?: string;
  instructor_id: number;
  unit?: string;
  thumbnail_url?: string | null;
  file_count: number;
  status: CourseStatus;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  instructor_name?: string;
  instructor_avatar?: string;
  enrolled_count?: number;
  category: string,
  level: string
}

// Course Material types
export type MaterialType = 'document' | 'video' | 'link' | 'assignment';

export interface CourseMaterial {
  id: number;
  course_id: number;
  title: string;
  type: MaterialType;
  url?: string;
  content?: string | null;
  sort_order: number;
  created_at: Date;
  uploaded_by?: number | null;
  is_active: boolean;
  updated_at?: Date;
  // Joined fields
  uploader_name?: string;
  uploader_avatar?: string;
}

// Discussion types
export interface DiscussionMessage {
  id: number;
  course_id: number;
  user_id: number;
  message: string;
  is_flagged: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at?: Date;
  // Joined fields
  user_name?: string;
  user_avatar?: string | null;
  user_role?: UserRole;
}

// Enrollment types
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'dropped';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: EnrollmentStatus;
  // payment_status: PaymentStatus;
  progress: number;
  enrolled_at: Date;
  completed_at?: Date | null;
  // Joined fields
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  course_title?: string;
  course_unit?: string;
}

// Lesson types
export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  scheduled_at: Date;
  duration_minutes: number;
  meeting_url?: string;
  created_at: Date;
  // Joined fields
  content?: string;
  instructor_name?: string;
  enrolled_students?: EnrolledStudent[];
}

export interface EnrolledStudent {
  id: number;
  name: string;
  avatar_url?: string | null;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard types
export interface DashboardStats {
  totalCourses: number;
  enrolledCourses: number;
  completedCourses: number;
  upcomingLessons: number;
}

export interface Reminder {
  id: number;
  title: string;
  date: Date;
  type: 'test' | 'essay' | 'class' | 'assignment';
  course_title?: string;
}

// Form types
export interface CourseFormData {
  title: string;
  description?: string;
  unit?: string;
  status: CourseStatus;
}

export interface EnrollmentFormData {
  user_id: number;
  course_id: number;
  status?: EnrollmentStatus;
  payment_status?: PaymentStatus;
}

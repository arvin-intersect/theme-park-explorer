export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Zone {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  map_position: { top: string; left: string };
}

export interface Shift {
  id: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  zones: { name: string } | null;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Certification {
  id: string;
  name: string;
}

export interface PerformanceReview {
  id: string;
  attendance_score: number | null;
  reliability_score: number | null;
  performance_rating: number | null;
}

export interface Employee {
  id: string;
  full_name: string;
  role: string;
  departments: { id: string, name: string } | null; 
}

export interface EmployeeWithDetails extends Employee {
  shifts: Shift[];
  // THIS IS THE FIX: The join returns an array of objects, 
  // where each object has a singular 'skills' or 'certifications' property.
  employee_skills: { skills: Skill }[];
  employee_certifications: { certifications: Certification }[];
  performance_reviews: PerformanceReview[];
}

export interface Highlights {
  visitors: number;
  revenue: number;
  spend: number;
  profit: number;
}
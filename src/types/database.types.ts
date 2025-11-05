// FILE: src/types/database.types.ts
export type ShiftStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

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

// Base Shift interface for direct DB query
export interface Shift {
  id: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  zones: { name: string } | null; // Assumed structure from Supabase join
  status: ShiftStatus;
  department_name?: string; // Added for client-side enrichment in the fetching functions
}

// Type used specifically by the RPC function 'get_projected_employee_schedule'
// It also needs department_name for any subsequent client-side enrichment
export interface ProjectedShift {
  id: string;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  zones: { name: string } | null;
  department_name?: string; // Added for client-side enrichment
}

// For the Roster Dialog to show who is on a shift
export interface ShiftWithEmployee extends Shift {
  profiles: {
    id: string;
    full_name: string;
    role: string;
  } | null;
}

export interface SuggestedEmployee {
  id: string;
  full_name: string;
  role: string;
  avg_performance_rating: number;
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

export interface Profile {
  id: string;
  full_name: string;
  role: string;
  department_id: string;
}

export interface Employee extends Profile {
  departments: { id: string, name: string } | null; 
}

export interface EmployeeWithDetails extends Employee {
  // IMPORTANT: Shifts are no longer fetched directly as part of EmployeeWithDetails.
  // They are fetched by separate dedicated functions for "Requests" and "Upcoming Shifts".
  // shifts: Shift[]; // This line is intentionally commented out.
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

export type RosterSummary = {
  calendar_date: string;
  predicted_visitors: number;
  target_staff_count: number;
  rostered_staff_count: number;
  department_id?: string;
  department_name?: string;
};
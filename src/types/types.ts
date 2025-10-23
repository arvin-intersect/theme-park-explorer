// These types are simplified versions of your database tables for use in the frontend.
// They help ensure type safety when working with data from Supabase.

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
    zones: { name: string }; // From Supabase join
  }
  
  export interface Employee {
    id: string;
    full_name: string;
    role: string;
    departments: Department;
    shifts: Shift[];
    // For EmployeeSchedule component
    skills: { name: string }[];
    certifications: { name: string }[];
    // For performance tables
    performance_reviews: {
      attendance_score: number;
      reliability_score: number;
      performance_rating: number;
    }[];
  }
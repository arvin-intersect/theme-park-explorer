// arvin-intersect-theme-park-explorer/src/api/lib/constants.ts

// --- Peakville Amusement Park Data Schema ---
// Based on your src/types/database.types.ts and supabase-seeder/generate-mock-data.js
export const DB_SCHEMA = `
Database: Peakville Amusement Park

Tables:
- profiles (Employees):
  - id (uuid): Primary key, unique employee ID.
  - full_name (text): Employee's full name.
  - role (text): Employee's job role (e.g., 'Ride Operator', 'Chef').
  - department_id (uuid): Foreign key to departments table.

- departments:
  - id (uuid): Primary key, unique department ID.
  - name (text): Department name (e.g., 'Rides & Attractions', 'Food Services').
  - icon (text): Emoji icon for the department.
  - color (text): HSL color string for the department.

- zones:
  - id (uuid): Primary key, unique zone ID.
  - slug (text): URL-friendly slug for the zone.
  - name (text): Zone name (e.g., 'Frontier Town', 'Gala Galaxy').
  - description (text): Description of the zone.
  - icon (text): Emoji icon for the zone.
  - map_position (jsonb): JSON object storing top/left position on a map.

- skills:
  - id (uuid): Primary key, unique skill ID.
  - name (text): Skill name (e.g., 'First Aid', 'Cash Handling').

- certifications:
  - id (uuid): Primary key, unique certification ID.
  - name (text): Certification name (e.g., 'Ride Safety Level 1', 'CPR Certified').

- employee_skills: (Join table)
  - employee_id (uuid): Foreign key to profiles table.
  - skill_id (uuid): Foreign key to skills table.

- employee_certifications: (Join table)
  - employee_id (uuid): Foreign key to profiles table.
  - certification_id (uuid): Foreign key to certifications table.

- shifts:
  - id (uuid): Primary key, unique shift ID.
  - employee_id (uuid): Foreign key to profiles table.
  - zone_id (uuid): Foreign key to zones table.
  - start_time (timestamp with time zone): Start date and time of the shift.
  - end_time (timestamp with time zone): End date and time of the shift.
  - status (text): Shift status ('pending', 'confirmed', 'rejected', 'cancelled').

- performance_reviews:
  - id (uuid): Primary key, unique review ID.
  - employee_id (uuid): Foreign key to profiles table.
  - review_date (date): Date of the review.
  - attendance_score (integer): Employee's attendance score (0-100).
  - reliability_score (integer): Employee's reliability score (0-100).
  - performance_rating (double precision): Employee's performance rating (e.0-5.0).
  - manager_notes (text): Manager's notes for the review.

- attractions:
  - id (uuid): Primary key, unique attraction ID.
  - zone_id (uuid): Foreign key to zones table.
  - name (text): Attraction name.
  - type (text): Type of attraction (e.g., 'ride', 'shop', 'restaurant').
  - icon (text): Emoji icon for the attraction.
  - tags (text[]): Array of tags for the attraction.

- daily_visitor_predictions:
  - date (date): Date of the prediction.
  - predicted_visitors (integer): Predicted number of visitors for that date.
  - target_staff_count (integer): Target number of staff for that date.

- realtime_metrics:
  - attraction_id (uuid): Foreign key to attractions table.
  - wait_time_minutes (integer): Current wait time in minutes.
  - status (text): Current operational status.

- highlights: (for admin alerts to managers)
  - id (uuid): Primary key, unique highlight ID.
  - department_id (uuid): Foreign key to departments table.
  - message (text): The alert message.
  - author (text): Who sent the alert (e.g., 'Admin').
  - created_at (timestamp with time zone): When the alert was created.
  - is_active (boolean): Is the alert currently active?

RPC Functions (you can use these like regular tables in your SQL, e.g. SELECT * FROM get_daily_department_health('2024-01-01')):
- get_daily_department_health(target_date date): Returns department health for a specific date.
  - Columns: department_id, department_name, rostered_staff_count, target_staff_count, roster_percentage
- get_calendar_overview(start_date date, end_date date, target_department_id uuid): Returns roster summary for a date range.
  - Columns: calendar_date, predicted_visitors, target_staff_count, rostered_staff_count
- get_department_stats(): Returns aggregated statistics for all departments.
  - Columns: id, name, icon, color, staff_count, avg_efficiency (based on performance reviews)
- get_department_employees_by_performance(target_department_id uuid): Returns employees in a department by performance.
  - Columns: id, full_name, role, avg_performance_rating
- get_zone_details(p_zone_slug text): Returns details for a specific zone.
  - Columns: id, name, description, icon, department_id, department_name, projections (visitors, revenue), employees (id, full_name, role, avg_performance_rating)
- get_projected_employee_schedule(p_employee_id uuid, p_start_date date, p_end_date date): Returns an employee's projected schedule.
  - Columns: id, start_time, end_time, status, zones (name)
- get_available_employees_for_day(target_date date): Returns employees available on a specific day.
  - Columns: id, full_name, role, avg_performance_rating
- get_roster_for_day(target_department_id uuid, target_date date): Returns rostered staff for a department on a specific day.
  - Columns: id, status, employee_id, employee_full_name, employee_role

IMPORTANT:
- Dates are stored as 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SSZ' for timestamps. Use appropriate functions (e.g., TO_DATE, DATE_TRUNC, EXTRACT) for date comparisons or aggregation. When specifying 'today' or 'current_date', explicitly use '2024-01-01' as this is the pattern start in your mock data.
- When joining, use explicit \`ON\` clauses.
- When selecting related data, you can often use \`table (column1, column2)\` syntax in Supabase select statements for cleaner joins, but standard JOIN syntax is also valid.
- For \`map_position\` (JSONB) or \`tags\` (text[]), you might need specific JSON or array operators if filtering on them.
- Always assume current date is '2024-01-01' for queries referencing 'today' or 'current date' due to the mock data pattern start.
`;

// CACHED QUERIES with visualization metadata for Peakville Amusement Park
export const CACHED_QUERIES = {
    "PK1": {
        "patterns": ["total employees", "number of staff"],
        "sql": 'SELECT COUNT(id) AS total_employees FROM profiles',
        "description": "Total number of employees.",
        "viz_type": null
    },
    "PK2": {
        "patterns": ["employees by department", "staff count per department"],
        "sql": 'SELECT d.name AS department_name, COUNT(p.id) AS employee_count FROM profiles p JOIN departments d ON p.department_id = d.id GROUP BY d.name ORDER BY employee_count DESC',
        "description": "Number of employees in each department.",
        "viz_type": "bar",
        "viz_config": {"x_field": "department_name", "y_field": "employee_count", "title": "Employees by Department"}
    },
    "PK3": {
        "patterns": ["average performance rating by department", "avg rating department"],
        "sql": 'SELECT d.name AS department_name, AVG(pr.performance_rating) AS avg_rating FROM profiles p JOIN departments d ON p.department_id = d.id JOIN performance_reviews pr ON p.id = pr.employee_id GROUP BY d.name ORDER BY avg_rating DESC',
        "description": "Average performance rating for each department.",
        "viz_type": "bar",
        "viz_config": {"x_field": "department_name", "y_field": "avg_rating", "title": "Avg Performance Rating by Department"}
    },
    "PK4": {
        "patterns": ["total number of zones", "how many zones"],
        "sql": 'SELECT COUNT(id) AS total_zones FROM zones',
        "description": "Total number of zones in the park.",
        "viz_type": null
    },
    "PK5": {
        "patterns": ["attractions per zone", "number of attractions by zone"],
        "sql": 'SELECT z.name AS zone_name, COUNT(a.id) AS attraction_count FROM attractions a JOIN zones z ON a.zone_id = z.id GROUP BY z.name ORDER BY attraction_count DESC',
        "description": "Number of attractions in each zone.",
        "viz_type": "bar",
        "viz_config": {"x_field": "zone_name", "y_field": "attraction_count", "title": "Attractions per Zone"}
    },
    "PK6": {
        "patterns": ["today's predicted visitors", "predicted visitors for today"],
        "sql": "SELECT predicted_visitors FROM daily_visitor_predictions WHERE date = '2024-01-01'",
        "description": "Predicted number of visitors for today (based on 2024-01-01 pattern).",
        "viz_type": null
    },
    "PK7": {
        "patterns": ["average wait time for attractions", "avg attraction wait time"],
        "sql": 'SELECT AVG(wait_time_minutes) AS average_wait_time FROM realtime_metrics',
        "description": "Average wait time across all operational attractions.",
        "viz_type": null
    },
    "PK8": {
        "patterns": ["employee with highest performance rating", "top performer employee"],
        "sql": 'SELECT p.full_name, AVG(pr.performance_rating) AS avg_rating FROM profiles p JOIN performance_reviews pr ON p.id = pr.employee_id GROUP BY p.full_name ORDER BY avg_rating DESC LIMIT 1',
        "description": "Employee with the highest average performance rating.",
        "viz_type": "bar",
        "viz_config": {"x_field": "full_name", "y_field": "avg_rating", "title": "Top Performing Employee"}
    },
    "PK9": {
        "patterns": ["total confirmed shifts", "number of confirmed shifts"],
        "sql": "SELECT COUNT(id) AS confirmed_shifts_count FROM shifts WHERE status = 'confirmed'",
        "description": "Total number of confirmed shifts.",
        "viz_type": null
    },
    "PK10": {
        "patterns": ["pending shift requests", "shifts pending approval"],
        "sql": "SELECT COUNT(id) AS pending_shifts_count FROM shifts WHERE status = 'pending'",
        "description": "Total number of pending shift requests.",
        "viz_type": null
    },
    "PK11": {
        "patterns": ["staffing targets for today", "target staff count today"],
        "sql": "SELECT target_staff_count FROM daily_visitor_predictions WHERE date = '2024-01-01'",
        "description": "Target staff count for today (based on 2024-01-01 pattern).",
        "viz_type": null
    },
    "PK12": {
        "patterns": ["departments with critical roster health today", "critical departments today"],
        "sql": "SELECT department_name, roster_percentage FROM get_daily_department_health('2024-01-01') WHERE roster_percentage < 70 ORDER BY roster_percentage ASC",
        "description": "Departments with critical roster health (less than 70%) for today.",
        "viz_type": "bar",
        "viz_config": {"x_field": "department_name", "y_field": "roster_percentage", "title": "Critical Roster Health Today (%)"}
    },
    "PK13": {
        "patterns": ["all skills", "list all skills"],
        "sql": "SELECT name FROM skills ORDER BY name",
        "description": "List of all defined skills.",
        "viz_type": null
    },
    "PK14": {
        "patterns": ["all certifications", "list all certifications"],
        "sql": "SELECT name FROM certifications ORDER BY name",
        "description": "List of all defined certifications.",
        "viz_type": null
    },
    "PK15": {
        "patterns": ["number of rides", "count of rides", "how many rides"],
        "sql": "SELECT COUNT(id) AS rides_count FROM attractions WHERE type = 'ride'",
        "description": "Total number of rides.",
        "viz_type": null
    },
    "PK16": {
        "patterns": ["number of shops", "count of shops", "how many shops"],
        "sql": "SELECT COUNT(id) AS shops_count FROM attractions WHERE type = 'shop'",
        "description": "Total number of shops.",
        "viz_type": null
    },
    "PK17": {
        "patterns": ["number of restaurants", "count of restaurants", "how many restaurants"],
        "sql": "SELECT COUNT(id) AS restaurants_count FROM attractions WHERE type = 'restaurant'",
        "description": "Total number of restaurants.",
        "viz_type": null
    },
    "PK18": {
        "patterns": ["monthly visitor predictions", "visitors by month"],
        "sql": "SELECT TO_CHAR(date, 'YYYY-MM') AS month, SUM(predicted_visitors) AS total_predicted_visitors FROM daily_visitor_predictions GROUP BY month ORDER BY month",
        "description": "Total predicted visitors per month.",
        "viz_type": "line",
        "viz_config": {"x_field": "month", "y_field": "total_predicted_visitors", "title": "Monthly Visitor Predictions"}
    },
    "PK19": {
        "patterns": ["monthly staff targets", "staff targets by month"],
        "sql": "SELECT TO_CHAR(date, 'YYYY-MM') AS month, SUM(target_staff_count) AS total_target_staff FROM daily_visitor_predictions GROUP BY month ORDER BY month",
        "description": "Total target staff count per month.",
        "viz_type": "line",
        "viz_config": {"x_field": "month", "y_field": "total_target_staff", "title": "Monthly Staff Targets"}
    },
    "PK20": {
        "patterns": ["employees with first aid certification"],
        "sql": `
            SELECT p.full_name
            FROM profiles p
            JOIN employee_certifications ec ON p.id = ec.employee_id
            JOIN certifications c ON ec.certification_id = c.id
            WHERE c.name = 'First Aid'
            ORDER BY p.full_name
        `,
        "description": "Employees who have 'First Aid' certification.",
        "viz_type": null
    },
    "PK21": {
        "patterns": ["employees with ride operation skill"],
        "sql": `
            SELECT p.full_name
            FROM profiles p
            JOIN employee_skills es ON p.id = es.employee_id
            JOIN skills s ON es.skill_id = s.id
            WHERE s.name = 'Ride Operation'
            ORDER BY p.full_name
        `,
        "description": "Employees with 'Ride Operation' skill.",
        "viz_type": null
    },
    "PK22": {
        "patterns": ["zones by description containing 'town'"],
        "sql": "SELECT name, description FROM zones WHERE description ILIKE '%town%'",
        "description": "Zones whose descriptions contain 'town'.",
        "viz_type": null
    },
     "PK23": {
        "patterns": ["latest active admin alert"],
        "sql": "SELECT message, author, created_at FROM highlights WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1",
        "description": "The most recent active alert from an admin.",
        "viz_type": null
    }
};

export interface CachedQuery {
    patterns: string[];
    sql: string;
    description: string;
    viz_type: "bar" | "pie" | "line" | null;
    viz_config?: {
        x_field?: string;
        y_field?: string;
        label_field?: string;
        value_field?: string;
        title: string;
    };
}

export interface CachedQueryResult extends CachedQuery {
    query_id: string;
    cached: boolean;
}
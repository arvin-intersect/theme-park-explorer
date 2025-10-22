export interface Department {
  id: string;
  name: string;
  icon: string;
  efficiency: number;
  staffCount: number;
  status: "optimal" | "adequate" | "critical";
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  attendance: number;
  reliability: number;
  performanceRating: number;
  ordersServed?: number;
  skills: string[];
  certifications: string[];
  shifts: Shift[];
}

export interface Shift {
  date: string;
  time: string;
  duration: string;
  zone: string;
}

export const departments: Department[] = [
  {
    id: "rides",
    name: "Rides & Attractions",
    icon: "🎢",
    efficiency: 94,
    staffCount: 450,
    status: "optimal",
    color: "hsl(186, 75%, 40%)",
  },
  {
    id: "food",
    name: "Food Services",
    icon: "🍔",
    efficiency: 87,
    staffCount: 380,
    status: "adequate",
    color: "hsl(30, 95%, 60%)",
  },
  {
    id: "retail",
    name: "Retail & Shops",
    icon: "🛍️",
    efficiency: 91,
    staffCount: 280,
    status: "optimal",
    color: "hsl(340, 85%, 55%)",
  },
  {
    id: "maintenance",
    name: "Maintenance",
    icon: "🔧",
    efficiency: 78,
    staffCount: 220,
    status: "critical",
    color: "hsl(38, 92%, 50%)",
  },
];

export const mockEmployees: Employee[] = [
  {
    id: "E001",
    name: "Sarah Johnson",
    department: "Rides & Attractions",
    role: "Ride Operator",
    attendance: 98,
    reliability: 96,
    performanceRating: 4.8,
    skills: ["Sky Serpent", "Thunder Drop", "Safety Certified"],
    certifications: ["Ride Safety Level 3", "First Aid", "Guest Relations"],
    shifts: [
      { date: "2025-10-22", time: "09:00 AM", duration: "8h", zone: "Thrill Zone" },
      { date: "2025-10-23", time: "02:00 PM", duration: "8h", zone: "Thrill Zone" },
      { date: "2025-10-25", time: "09:00 AM", duration: "8h", zone: "Water Park" },
      { date: "2025-10-28", time: "09:00 AM", duration: "8h", zone: "Thrill Zone" },
      { date: "2025-10-30", time: "02:00 PM", duration: "8h", zone: "Thrill Zone" },
    ],
  },
  {
    id: "E002",
    name: "Michael Chen",
    department: "Food Services",
    role: "Chef",
    attendance: 95,
    reliability: 94,
    performanceRating: 4.5,
    ordersServed: 210,
    skills: ["Grill Master", "Menu Planning", "Food Safety"],
    certifications: ["ServSafe", "Allergen Awareness", "Kitchen Management"],
    shifts: [
      { date: "2025-10-22", time: "11:00 AM", duration: "8h", zone: "Food Court" },
      { date: "2025-10-24", time: "11:00 AM", duration: "8h", zone: "Food Court" },
      { date: "2025-10-26", time: "05:00 PM", duration: "6h", zone: "Pizza Paradise" },
    ],
  },
  {
    id: "E003",
    name: "Jessica Davis",
    department: "Retail & Shops",
    role: "Store Manager",
    attendance: 99,
    reliability: 97,
    performanceRating: 4.9,
    skills: ["Inventory Management", "Visual Merchandising", "POS Systems"],
    certifications: ["Retail Management Cert.", "Customer Service Excellence"],
    shifts: [{ date: "2025-10-22", time: "10:00 AM", duration: "8h", zone: "Shopping District" }],
  },
  {
    id: "E004",
    name: "David Wilson",
    department: "Maintenance",
    role: "Technician",
    attendance: 92,
    reliability: 98,
    performanceRating: 4.6,
    skills: ["Mechanical Repair", "Electrical Systems", "Hydraulics"],
    certifications: ["Certified Maintenance Technician", "OSHA 30"],
    shifts: [{ date: "2025-10-22", time: "06:00 AM", duration: "8h", zone: "Thrill Rides" }],
  },
  {
    id: "E005",
    name: "Emily Rodriguez",
    department: "Rides & Attractions",
    role: "Junior Operator",
    attendance: 96,
    reliability: 91,
    performanceRating: 4.2,
    skills: ["Twisted Tornado", "River Rapids", "Guest Assistance"],
    certifications: ["Ride Safety Level 1", "First Aid"],
    shifts: [{ date: "2025-10-23", time: "12:00 PM", duration: "8h", zone: "Thrill Rides" }],
  },
  {
    id: "E006",
    name: "Chris Lee",
    department: "Food Services",
    role: "Cashier",
    attendance: 97,
    reliability: 93,
    performanceRating: 4.4,
    ordersServed: 350,
    skills: ["Cash Handling", "Customer Service", "Speedy Checkout"],
    certifications: ["Food Handler Permit"],
    shifts: [{ date: "2025-10-22", time: "11:00 AM", duration: "8h", zone: "Food Court" }],
  },
  {
    id: "E007",
    name: "Olivia Green",
    department: "Rides & Attractions",
    role: "Team Lead",
    attendance: 99,
    reliability: 98,
    performanceRating: 4.9,
    skills: ["Carousel Dreams", "Mini Train", "Team Supervision"],
    certifications: ["Guest Experience Lead", "First Aid"],
    shifts: [{ date: "2025-10-22", time: "09:00 AM", duration: "8h", zone: "Family Zone" }],
  },
  {
    id: "E008",
    name: "Daniel Garcia",
    department: "Rides & Attractions",
    role: "Lifeguard",
    attendance: 94,
    reliability: 95,
    performanceRating: 4.3,
    skills: ["Wave Pool", "Lazy River", "Water Rescue"],
    certifications: ["Lifeguard Certified", "CPR"],
    shifts: [{ date: "2025-10-22", time: "10:00 AM", duration: "8h", zone: "Water Park" }],
  },
];

export const visitorForecast = [
  { day: "Mon", visitors: 14200, revenue: 568000 },
  { day: "Tue", visitors: 13800, revenue: 552000 },
  { day: "Wed", visitors: 15100, revenue: 604000 },
  { day: "Thu", visitors: 18500, revenue: 740000 },
  { day: "Fri", visitors: 26200, revenue: 1048000 },
  { day: "Sat", visitors: 38500, revenue: 1540000 },
  { day: "Sun", visitors: 35200, revenue: 1408000 },
  { day: "Mon", visitors: 14300, revenue: 572000 },
  { day: "Tue", visitors: 13900, revenue: 556000 },
  { day: "Wed", visitors: 15200, revenue: 608000 },
  { day: "Thu", visitors: 18700, revenue: 748000 },
  { day: "Fri", visitors: 28500, revenue: 1140000 },
  { day: "Sat", visitors: 41000, revenue: 1640000 },
  { day: "Sun", visitors: 39800, revenue: 1592000 },
];

export const rosterData = [
  {
    time: "09:00 AM",
    rides: 120,
    food: 80,
    retail: 60,
    maintenance: 40,
  },
  {
    time: "12:00 PM",
    rides: 150,
    food: 120,
    retail: 90,
    maintenance: 50,
  },
  {
    time: "03:00 PM",
    rides: 180,
    food: 150,
    retail: 100,
    maintenance: 60,
  },
  {
    time: "06:00 PM",
    rides: 150,
    food: 140,
    retail: 80,
    maintenance: 40,
  },
  {
    time: "09:00 PM",
    rides: 80,
    food: 60,
    retail: 40,
    maintenance: 30,
  },
];

export const alerts = [
  {
    id: "A001",
    type: "critical",
    message: "Maintenance team understaffed - 3 positions needed",
    department: "Maintenance",
    timestamp: "10 mins ago",
  },
  {
    id: "A002",
    type: "warning",
    message: "Food Services experiencing above-average wait times",
    department: "Food Services",
    timestamp: "25 mins ago",
  },
  {
    id: "A003",
    type: "info",
    message: "High visitor forecast for Saturday - Consider extra staffing",
    department: "All Departments",
    timestamp: "1 hour ago",
  },
];

export interface TodayHighlights {
  visitors: number;
  revenue: number;
  spend: number;
  profit: number;
}

export const todayHighlights: TodayHighlights = {
  visitors: 36247,
  revenue: 1449880,
  spend: 652450,
  profit: 797430,
};
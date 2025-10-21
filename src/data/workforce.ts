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
    staffCount: 45,
    status: "optimal",
    color: "hsl(186, 75%, 40%)",
  },
  {
    id: "food",
    name: "Food Services",
    icon: "🍔",
    efficiency: 87,
    staffCount: 38,
    status: "adequate",
    color: "hsl(30, 95%, 60%)",
  },
  {
    id: "retail",
    name: "Retail & Shops",
    icon: "🛍️",
    efficiency: 91,
    staffCount: 28,
    status: "optimal",
    color: "hsl(340, 85%, 55%)",
  },
  {
    id: "maintenance",
    name: "Maintenance",
    icon: "🔧",
    efficiency: 78,
    staffCount: 22,
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
  { day: "Mon", visitors: 4200, revenue: 168000 },
  { day: "Tue", visitors: 3800, revenue: 152000 },
  { day: "Wed", visitors: 4100, revenue: 164000 },
  { day: "Thu", visitors: 4500, revenue: 180000 },
  { day: "Fri", visitors: 6200, revenue: 248000 },
  { day: "Sat", visitors: 8500, revenue: 340000 },
  { day: "Sun", visitors: 8200, revenue: 328000 },
  { day: "Mon", visitors: 4300, revenue: 172000 },
  { day: "Tue", visitors: 3900, revenue: 156000 },
  { day: "Wed", visitors: 4200, revenue: 168000 },
  { day: "Thu", visitors: 4700, revenue: 188000 },
  { day: "Fri", visitors: 6500, revenue: 260000 },
  { day: "Sat", visitors: 9000, revenue: 360000 },
  { day: "Sun", visitors: 8800, revenue: 352000 },
];

export const rosterData = [
  {
    time: "09:00 AM",
    rides: 12,
    food: 8,
    retail: 6,
    maintenance: 4,
  },
  {
    time: "12:00 PM",
    rides: 15,
    food: 12,
    retail: 9,
    maintenance: 5,
  },
  {
    time: "03:00 PM",
    rides: 18,
    food: 15,
    retail: 10,
    maintenance: 6,
  },
  {
    time: "06:00 PM",
    rides: 15,
    food: 14,
    retail: 8,
    maintenance: 4,
  },
  {
    time: "09:00 PM",
    rides: 8,
    food: 6,
    retail: 4,
    maintenance: 3,
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
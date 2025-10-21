export interface Zone {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: {
    from: string;
    to: string;
  };
  position: {
    top: string;
    left: string;
  };
  stats: {
    rating: string;
    visitors: string;
    waitTime: string;
    revenue: number;
    profitability: number; // As a percentage
    employees: number;
  };
  attractions: {
    name: string;
    icon: string;
    description: string;
    tags: string[];
  }[];
  assignedEmployees: string[];
}

export const zones: Zone[] = [
  {
    id: "thrills",
    name: "Thrill Rides",
    icon: "🎢",
    description: "Experience heart-pounding roller coasters and extreme attractions!",
    color: "bg-primary",
    gradient: {
      from: "hsl(186, 75%, 40%)",
      to: "hsl(186, 85%, 55%)",
    },
    position: {
      top: "15%",
      left: "20%",
    },
    stats: {
      rating: "4.9/5",
      visitors: "2.5k",
      waitTime: "25 min",
      revenue: 45000,
      profitability: 75,
      employees: 18,
    },
    attractions: [
      {
        name: "Sky Serpent",
        icon: "🐉",
        description: "The tallest roller coaster in the park with 5 inversions",
        tags: ["Extreme", "High Speed", "Popular"],
      },
      {
        name: "Thunder Drop",
        icon: "⚡",
        description: "Free-fall tower reaching 200 feet high",
        tags: ["Scary", "Quick", "Adrenaline"],
      },
      {
        name: "Twisted Tornado",
        icon: "🌪️",
        description: "Spinning coaster with unpredictable turns",
        tags: ["Spinning", "Family", "Fun"],
      },
      {
        name: "River Rapids",
        icon: "🌊",
        description: "Water coaster adventure through rocky terrain",
        tags: ["Wet", "Refreshing", "Scenic"],
      },
    ],
    assignedEmployees: ["E001", "E005"],
  },
  {
    id: "water",
    name: "Water Park",
    icon: "🏊",
    description: "Splash into fun with slides, pools, and water attractions!",
    color: "bg-primary",
    gradient: {
      from: "hsl(200, 75%, 45%)",
      to: "hsl(180, 85%, 60%)",
    },
    position: {
      top: "45%",
      left: "15%",
    },
    stats: {
      rating: "4.7/5",
      visitors: "3.2k",
      waitTime: "15 min",
      revenue: 62000,
      profitability: 68,
      employees: 22,
    },
    attractions: [
      {
        name: "Aqua Loop",
        icon: "🌀",
        description: "Vertical loop water slide for brave souls",
        tags: ["Extreme", "Wet", "Thrilling"],
      },
      {
        name: "Lazy River",
        icon: "🛟",
        description: "Relaxing float around the park",
        tags: ["Relaxing", "Family", "Chill"],
      },
      {
        name: "Wave Pool",
        icon: "🌊",
        description: "Artificial waves up to 6 feet high",
        tags: ["Fun", "Swimming", "Active"],
      },
      {
        name: "Splash Zone",
        icon: "💦",
        description: "Interactive water playground for kids",
        tags: ["Kids", "Safe", "Interactive"],
      },
    ],
    assignedEmployees: ["E008"],
  },
  {
    id: "shops",
    name: "Shopping District",
    icon: "🛍️",
    description: "Browse unique souvenirs, gifts, and park merchandise!",
    color: "bg-secondary",
    gradient: {
      from: "hsl(30, 95%, 60%)",
      to: "hsl(20, 95%, 55%)",
    },
    position: {
      top: "55%",
      left: "50%",
    },
    stats: {
      rating: "4.8/5",
      visitors: "1.8k",
      waitTime: "5 min",
      revenue: 35000,
      profitability: 82,
      employees: 15,
    },
    attractions: [
      {
        name: "Adventure Outfitters",
        icon: "👕",
        description: "Official park apparel and accessories",
        tags: ["Clothing", "Souvenirs", "Popular"],
      },
      {
        name: "Toy Emporium",
        icon: "🧸",
        description: "Plush toys and collectibles from all zones",
        tags: ["Toys", "Kids", "Gifts"],
      },
      {
        name: "Photo Gallery",
        icon: "📸",
        description: "Pick up your ride photos and create memories",
        tags: ["Photos", "Memories", "Quick"],
      },
      {
        name: "Candy Castle",
        icon: "🍭",
        description: "Sweet treats and confections",
        tags: ["Sweets", "Snacks", "Tasty"],
      },
    ],
    assignedEmployees: ["E003"],
  },
  {
    id: "food",
    name: "Food Court",
    icon: "🍔",
    description: "Delicious dining options from around the world!",
    color: "bg-accent",
    gradient: {
      from: "hsl(340, 85%, 55%)",
      to: "hsl(280, 75%, 60%)",
    },
    position: {
      top: "65%",
      left: "70%",
    },
    stats: {
      rating: "4.6/5",
      visitors: "4.1k",
      waitTime: "10 min",
      revenue: 85000,
      profitability: 65,
      employees: 30,
    },
    attractions: [
      {
        name: "Burger Bliss",
        icon: "🍔",
        description: "Gourmet burgers and classic American fare",
        tags: ["Fast Food", "Popular", "Filling"],
      },
      {
        name: "Pizza Paradise",
        icon: "🍕",
        description: "New York style pizza by the slice",
        tags: ["Italian", "Quick", "Tasty"],
      },
      {
        name: "Taco Town",
        icon: "🌮",
        description: "Authentic Mexican street food",
        tags: ["Mexican", "Spicy", "Fresh"],
      },
      {
        name: "Ice Cream Dream",
        icon: "🍦",
        description: "Premium ice cream and frozen treats",
        tags: ["Dessert", "Cold", "Sweet"],
      },
      {
        name: "Funnel Cake Factory",
        icon: "🧇",
        description: "Classic carnival treats and sweets",
        tags: ["Snacks", "Sweet", "Carnival"],
      },
    ],
    assignedEmployees: ["E002", "E006"],
  },
  {
    id: "ferris",
    name: "Ferris Wheel",
    icon: "🎡",
    description: "Enjoy panoramic views of the entire park from 150 feet up!",
    color: "bg-primary",
    gradient: {
      from: "hsl(280, 75%, 60%)",
      to: "hsl(240, 85%, 65%)",
    },
    position: {
      top: "30%",
      left: "75%",
    },
    stats: {
      rating: "4.9/5",
      visitors: "1.5k",
      waitTime: "12 min",
      revenue: 12000,
      profitability: 85,
      employees: 4,
    },
    attractions: [
      {
        name: "Sky High View",
        icon: "👁️",
        description: "See the entire park from the top",
        tags: ["Scenic", "Relaxing", "Romantic"],
      },
      {
        name: "VIP Gondolas",
        icon: "💎",
        description: "Private enclosed cabins with premium seating",
        tags: ["Premium", "Private", "Luxury"],
      },
      {
        name: "Night Lights",
        icon: "✨",
        description: "Evening rides with spectacular light show",
        tags: ["Evening", "Beautiful", "Special"],
      },
    ],
    assignedEmployees: [],
  },
  {
    id: "family",
    name: "Family Zone",
    icon: "👨‍👩‍👧‍👦",
    description: "Gentle rides and attractions perfect for all ages!",
    color: "bg-secondary",
    gradient: {
      from: "hsl(150, 75%, 50%)",
      to: "hsl(120, 85%, 60%)",
    },
    position: {
      top: "75%",
      left: "35%",
    },
    stats: {
      rating: "4.8/5",
      visitors: "3.5k",
      waitTime: "8 min",
      revenue: 55000,
      profitability: 70,
      employees: 25,
    },
    attractions: [
      {
        name: "Carousel Dreams",
        icon: "🎠",
        description: "Classic carousel with hand-painted horses",
        tags: ["Classic", "Kids", "Gentle"],
      },
      {
        name: "Mini Train",
        icon: "🚂",
        description: "Scenic tour around the park",
        tags: ["Relaxing", "Scenic", "Family"],
      },
      {
        name: "Bumper Cars",
        icon: "🚗",
        description: "Classic bumper car arena",
        tags: ["Interactive", "Fun", "Active"],
      },
      {
        name: "Tea Cups",
        icon: "☕",
        description: "Spinning tea cup ride",
        tags: ["Spinning", "Mild", "Classic"],
      },
    ],
    assignedEmployees: ["E007"],
  },
];
// generate-mock-data-csv.js
import { faker } from '@faker-js/faker';
import fs from 'fs';

// --- CONFIGURATION ---
const NUM_EMPLOYEES = 1000;
const NUM_ZONES = 7;
const NUM_ATTRACTIONS_PER_ZONE = 5;
const NUM_SHIFTS = 5000;
const NUM_REVIEWS_PER_EMPLOYEE = 3;
const NUM_DAYS_OF_STATS = 30;
const OUTPUT_DIR = './csv_output';

// --- SCRIPT START ---
console.log('Starting mock data generation for CSV...');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// In-memory storage for generated data to build relationships
const dataStore = {
    departments: [],
    zones: [],
    skills: [],
    certifications: [],
    attractions: [],
    users: [], // For the special SQL script
    profiles: [],
    employee_skills: [],
    employee_certifications: [],
    shifts: [],
    performance_reviews: [],
    realtime_metrics: [],
    daily_operational_stats: [],
};

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, count) => faker.helpers.shuffle(arr).slice(0, count);

const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') {
                // Escape quotes by doubling them and wrap the whole string in quotes
                return `"${value.replace(/"/g, '""')}"`;
            }
            if (typeof value === 'object') {
                // Handle JSON and Array types for CSV
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
};

// --- 1. GENERATE CORE DATA (NO DEPENDENCIES) ---
console.log('Generating departments, zones, skills, certifications...');
const DEPARTMENTS = [
    { name: 'Rides & Attractions', icon: '🎢', color: 'hsl(186, 75%, 40%)' },
    { name: 'Food Services', icon: '🍔', color: 'hsl(30, 95%, 60%)' },
    { name: 'Retail & Shops', icon: '🛍️', color: 'hsl(340, 85%, 55%)' },
    { name: 'Maintenance', icon: '🔧', color: 'hsl(38, 92%, 50%)' },
    { name: 'Guest Services', icon: 'ℹ️', color: 'hsl(220, 75%, 60%)' },
];
DEPARTMENTS.forEach(dept => {
    dataStore.departments.push({ id: faker.string.uuid(), ...dept });
});

for (let i = 0; i < NUM_ZONES; i++) {
    const zoneName = faker.location.city() + " Junction";
    dataStore.zones.push({
        id: faker.string.uuid(),
        slug: faker.helpers.slugify(zoneName).toLowerCase(),
        name: zoneName,
        description: faker.lorem.sentence(),
        icon: faker.internet.emoji(),
        map_position: JSON.stringify({ top: `${faker.number.int({ min: 10, max: 90 })}%`, left: `${faker.number.int({ min: 10, max: 90 })}%` }),
    });
}

const SKILLS = ['Ride Operation', 'Safety Certified', 'First Aid', 'Cash Handling', 'Grill Master', 'Customer Service', 'Mechanical Repair', 'Electrical Systems', 'Inventory Management'];
SKILLS.forEach(name => dataStore.skills.push({ id: faker.string.uuid(), name }));

const CERTIFICATIONS = ['Ride Safety Level 1', 'Ride Safety Level 2', 'ServSafe', 'CPR Certified', 'Master Electrician', 'Retail Management'];
CERTIFICATIONS.forEach(name => dataStore.certifications.push({ id: faker.string.uuid(), name }));

// --- 2. GENERATE DEPENDENT CORE DATA ---
console.log('Generating attractions...');
dataStore.zones.forEach(zone => {
    for (let i = 0; i < NUM_ATTRACTIONS_PER_ZONE; i++) {
        const type = faker.helpers.arrayElement(['ride', 'shop', 'restaurant']);
        dataStore.attractions.push({
            id: faker.string.uuid(),
            zone_id: zone.id,
            name: faker.company.name(),
            type: type,
            icon: faker.internet.emoji(),
            tags: `{${faker.word.adjective()},${faker.word.noun()}}`, // PostgreSQL array format
        });
    }
});

// --- 3. GENERATE USERS & PROFILES ---
console.log(`Generating ${NUM_EMPLOYEES} employees...`);
for (let i = 0; i < NUM_EMPLOYEES; i++) {
    const id = faker.string.uuid();
    dataStore.users.push({
        id,
        email: `user${i}@peakvillepark.dev`,
        full_name: faker.person.fullName(),
        department_id: getRandomElement(dataStore.departments).id,
        role: faker.person.jobTitle(),
    });
}
dataStore.users.forEach(user => {
    dataStore.profiles.push({
        id: user.id,
        full_name: user.full_name,
        department_id: user.department_id,
        role: user.role,
    });
});


// --- 4. GENERATE JOIN TABLES & RELATIONAL DATA ---
console.log('Assigning skills and certifications...');
dataStore.profiles.forEach(profile => {
    getRandomSubset(dataStore.skills, faker.number.int({ min: 2, max: 5 })).forEach(skill => {
        dataStore.employee_skills.push({ employee_id: profile.id, skill_id: skill.id });
    });
    getRandomSubset(dataStore.certifications, faker.number.int({ min: 0, max: 2 })).forEach(cert => {
        dataStore.employee_certifications.push({ employee_id: profile.id, certification_id: cert.id });
    });
});

console.log(`Generating ${NUM_SHIFTS} shifts...`);
for (let i = 0; i < NUM_SHIFTS; i++) {
    const startTime = faker.date.between({ from: new Date(), to: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) });
    dataStore.shifts.push({
        id: faker.string.uuid(),
        employee_id: getRandomElement(dataStore.profiles).id,
        zone_id: getRandomElement(dataStore.zones).id,
        start_time: startTime.toISOString(),
        end_time: new Date(startTime.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    });
}

console.log('Generating performance reviews...');
dataStore.profiles.forEach(profile => {
    for (let i = 0; i < NUM_REVIEWS_PER_EMPLOYEE; i++) {
        dataStore.performance_reviews.push({
            id: faker.string.uuid(),
            employee_id: profile.id,
            review_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
            attendance_score: faker.number.int({ min: 85, max: 100 }),
            reliability_score: faker.number.int({ min: 80, max: 100 }),
            performance_rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
            manager_notes: faker.lorem.paragraph().replace(/[\r\n,]/g, ' '),
        });
    }
});

// --- 5. GENERATE METRICS DATA ---
console.log('Generating realtime & daily stats...');
dataStore.attractions.forEach(attraction => {
    dataStore.realtime_metrics.push({
        attraction_id: attraction.id,
        wait_time_minutes: faker.number.int({ min: 5, max: 75 }),
        status: 'operational',
    });
});

for (let i = 0; i < NUM_DAYS_OF_STATS; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dataStore.zones.forEach(zone => {
        dataStore.daily_operational_stats.push({
            id: faker.string.uuid(), date: dateString, entity_type: 'zone', entity_id: zone.id,
            visitor_count: faker.number.int({ min: 5000, max: 15000 }),
            revenue: faker.finance.amount(20000, 80000),
            operating_cost: faker.finance.amount(10000, 30000),
        });
    });
}

// --- WRITE FILES ---
console.log('Writing CSV and SQL files...');

// Special handling for auth.users
let usersSql = `-- This script must be run first in the Supabase SQL Editor.\n-- It creates the authenticated users for your mock data.\n\n`;
dataStore.users.forEach(user => {
    // Password is 'password123' hashed
    usersSql += `INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, instance_id, created_at, updated_at) VALUES ('${user.id}', 'authenticated', 'authenticated', '${user.email}', '$2a$10$ih1yHiPudF585hR4f5fA9eBKE6vJp88CgCnHwB/T/b3jIucHYyOka', now(), '00000000-0000-0000-0000-000000000000', now(), now());\n`;
});
fs.writeFileSync(`${OUTPUT_DIR}/00_create_users.sql`, usersSql);


// Write CSV files
fs.writeFileSync(`${OUTPUT_DIR}/01_departments.csv`, convertToCSV(dataStore.departments));
fs.writeFileSync(`${OUTPUT_DIR}/02_zones.csv`, convertToCSV(dataStore.zones));
fs.writeFileSync(`${OUTPUT_DIR}/03_skills.csv`, convertToCSV(dataStore.skills));
fs.writeFileSync(`${OUTPUT_DIR}/04_certifications.csv`, convertToCSV(dataStore.certifications));
fs.writeFileSync(`${OUTPUT_DIR}/05_attractions.csv`, convertToCSV(dataStore.attractions));
fs.writeFileSync(`${OUTPUT_DIR}/06_profiles.csv`, convertToCSV(dataStore.profiles));
fs.writeFileSync(`${OUTPUT_DIR}/07_employee_skills.csv`, convertToCSV(dataStore.employee_skills));
fs.writeFileSync(`${OUTPUT_DIR}/08_employee_certifications.csv`, convertToCSV(dataStore.employee_certifications));
fs.writeFileSync(`${OUTPUT_DIR}/09_shifts.csv`, convertToCSV(dataStore.shifts));
fs.writeFileSync(`${OUTPUT_DIR}/10_performance_reviews.csv`, convertToCSV(dataStore.performance_reviews));
fs.writeFileSync(`${OUTPUT_DIR}/11_realtime_metrics.csv`, convertToCSV(dataStore.realtime_metrics));
fs.writeFileSync(`${OUTPUT_DIR}/12_daily_operational_stats.csv`, convertToCSV(dataStore.daily_operational_stats));

console.log(`✅ Generation complete! Check the '${OUTPUT_DIR}' folder.`);
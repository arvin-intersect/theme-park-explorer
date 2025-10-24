// generate-mock-data.js
import { faker } from '@faker-js/faker';
import fs from 'fs';
import { addDays, format, getDay } from 'date-fns';

// --- CONFIGURATION (NOW MUCH SMALLER) ---
const NUM_EMPLOYEES = 150; // REDUCED from 500
const NUM_ATTRACTIONS_PER_ZONE = 4;
const NUM_REVIEWS_PER_EMPLOYEE = 1;
const NUM_DAYS_OF_PREDICTIONS = 14; // REDUCED from 90 to create a 2-week pattern
const OUTPUT_DIR = './csv_output';

// --- SCRIPT START ---
console.log('Starting OPTIMIZED mock data generation...');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const dataStore = {
    departments: [], zones: [], skills: [], certifications: [], attractions: [],
    users: [], profiles: [], employee_skills: [], employee_certifications: [],
    shifts: [], performance_reviews: [], realtime_metrics: [], daily_visitor_predictions: [],
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
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            return value;
        });
        csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
};

// --- DATA DEFINITIONS ---
const DEPARTMENTS = [
    { name: 'Rides & Attractions', icon: '🎢', color: 'hsl(186, 75%, 40%)' },
    { name: 'Food Services', icon: '🍔', color: 'hsl(30, 95%, 60%)' },
    { name: 'Retail & Shops', icon: '🛍️', color: 'hsl(340, 85%, 55%)' },
    { name: 'Maintenance', icon: '🔧', color: 'hsl(38, 92%, 50%)' },
    { name: 'Guest Services', icon: 'ℹ️', color: 'hsl(220, 75%, 60%)' },
];

const ROLES_BY_DEPARTMENT = {
    'Rides & Attractions': ['Ride Operator', 'Attractions Lead', 'Safety Inspector'],
    'Food Services': ['Cashier', 'Line Cook', 'Chef', 'Bartender', 'Restaurant Host'],
    'Retail & Shops': ['Retail Associate', 'Merchandise Lead', 'Stocker'],
    'Maintenance': ['Technician', 'Electrician', 'Mechanic', 'Groundskeeper'],
    'Guest Services': ['Ticket Taker', 'Information Desk Staff', 'VIP Tour Guide'],
};

// --- NEW THEMATIC ZONE NAMES ---
const ZONE_NAMES = [
    "Frontier Town", "Adventure Bay", "Cosmic Canyon", "Mystic Forest", "Gala Galaxy",
    "Buccaneer's Wharf", "Tundra Peaks", "Dino Valley", "Kiddie Kingdom"
];

// --- 1. GENERATE CORE DATA ---
console.log('Generating core data with thematic zones...');
DEPARTMENTS.forEach(dept => dataStore.departments.push({ id: faker.string.uuid(), ...dept }));

// Use the new ZONE_NAMES list
faker.helpers.shuffle(ZONE_NAMES).slice(0, 7).forEach(zoneName => {
    dataStore.zones.push({
        id: faker.string.uuid(),
        slug: faker.helpers.slugify(zoneName).toLowerCase(),
        name: zoneName,
        description: faker.lorem.sentence(),
        icon: faker.internet.emoji(),
        map_position: JSON.stringify({ top: `${faker.number.int({ min: 10, max: 90 })}%`, left: `${faker.number.int({ min: 10, max: 90 })}%` }),
    });
});

['Ride Operation', 'Safety Certified', 'First Aid', 'Cash Handling', 'Grill Master', 'Customer Service'].forEach(name => dataStore.skills.push({ id: faker.string.uuid(), name }));
['Ride Safety Level 1', 'ServSafe', 'CPR Certified'].forEach(name => dataStore.certifications.push({ id: faker.string.uuid(), name }));
dataStore.zones.forEach(zone => {
    for (let i = 0; i < NUM_ATTRACTIONS_PER_ZONE; i++) dataStore.attractions.push({ id: faker.string.uuid(), zone_id: zone.id, name: faker.company.name(), type: faker.helpers.arrayElement(['ride', 'shop', 'restaurant']), icon: faker.internet.emoji(), tags: `{${faker.word.adjective()},${faker.word.noun()}}` });
});

// --- 2. GENERATE USERS & PROFILES ---
console.log(`Generating ${NUM_EMPLOYEES} employees...`);
for (let i = 0; i < NUM_EMPLOYEES; i++) {
    const id = faker.string.uuid();
    const department = getRandomElement(dataStore.departments);
    const role = getRandomElement(ROLES_BY_DEPARTMENT[department.name]);
    dataStore.users.push({ id, email: `user${i}@peakvillepark.dev`, full_name: faker.person.fullName(), department_id: department.id, role });
}
dataStore.users.forEach(user => dataStore.profiles.push({ id: user.id, full_name: user.full_name, department_id: user.department_id, role: user.role }));

// --- 3. GENERATE JOIN TABLES & RELATIONAL DATA ---
console.log('Assigning skills, certs, and reviews...');
dataStore.profiles.forEach(profile => {
    getRandomSubset(dataStore.skills, faker.number.int({ min: 1, max: 3 })).forEach(skill => dataStore.employee_skills.push({ employee_id: profile.id, skill_id: skill.id }));
    getRandomSubset(dataStore.certifications, faker.number.int({ min: 0, max: 2 })).forEach(cert => dataStore.employee_certifications.push({ employee_id: profile.id, certification_id: cert.id }));
    for (let i = 0; i < NUM_REVIEWS_PER_EMPLOYEE; i++) dataStore.performance_reviews.push({ id: faker.string.uuid(), employee_id: profile.id, review_date: faker.date.past({ years: 1 }).toISOString().split('T')[0], attendance_score: faker.number.int({ min: 85, max: 100 }), reliability_score: faker.number.int({ min: 80, max: 100 }), performance_rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }), manager_notes: faker.lorem.paragraph().replace(/[\r\n,]/g, ' ') });
});

// --- 4. GENERATE THE 14-DAY PATTERN FOR PREDICTIONS AND SHIFTS ---
console.log(`Generating ${NUM_DAYS_OF_PREDICTIONS}-day data pattern...`);
const patternStartDate = new Date('2024-01-01'); // Use a fixed start date for the pattern
for (let i = 0; i < NUM_DAYS_OF_PREDICTIONS; i++) {
    const currentDate = addDays(patternStartDate, i);
    const dayOfWeek = getDay(currentDate);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const predicted_visitors = isWeekend ? faker.number.int({ min: 40000, max: 50000 }) : faker.number.int({ min: 30000, max: 40000 });
    const target_staff_count = Math.floor(predicted_visitors / 11);
    dataStore.daily_visitor_predictions.push({ date: format(currentDate, 'yyyy-MM-dd'), predicted_visitors, target_staff_count });

    const rosteredCount = Math.floor(target_staff_count * faker.number.float({ min: 0.60, max: 0.98 }));
    const availableEmployees = faker.helpers.shuffle(dataStore.profiles);
    for (let j = 0; j < rosteredCount; j++) {
        const employee = availableEmployees[j % availableEmployees.length];
        const startTime = new Date(currentDate);
        startTime.setHours(faker.number.int({ min: 8, max: 12 }), 0, 0, 0);
        dataStore.shifts.push({ id: faker.string.uuid(), employee_id: employee.id, zone_id: getRandomElement(dataStore.zones).id, start_time: startTime.toISOString(), end_time: new Date(startTime.getTime() + 8 * 60 * 60 * 1000).toISOString() });
    }
}

// --- 5. GENERATE REALTIME METRICS ---
dataStore.attractions.forEach(attraction => dataStore.realtime_metrics.push({ attraction_id: attraction.id, wait_time_minutes: faker.number.int({ min: 5, max: 75 }), status: 'operational' }));

// --- WRITE FILES ---
console.log('Writing CSV and SQL files...');
let usersSql = `-- This script must be run first.\n\n`;
dataStore.users.forEach(user => {
    usersSql += `INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, instance_id, created_at, updated_at) VALUES ('${user.id}', 'authenticated', 'authenticated', '${user.email}', '$2a$10$ih1yHiPudF585hR4f5fA9eBKE6vJp88CgCnHwB/T/b3jIucHYyOka', now(), '00000000-0000-0000-0000-000000000000', now(), now());\n`;
});
fs.writeFileSync(`${OUTPUT_DIR}/00_create_users.sql`, usersSql);
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
fs.writeFileSync(`${OUTPUT_DIR}/13_daily_visitor_predictions.csv`, convertToCSV(dataStore.daily_visitor_predictions));

console.log(`✅ Generation complete! Your database will now be much smaller.`);
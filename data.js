// File: data.js
// In-memory mock database

// Mock Users
const users = [
    { id: 1, name: 'Alice Student', role: 'Student' },
    { id: 2, name: 'Dr. Bob Professor', role: 'Professor' }
];

// Storage arrays
const feedback = [
    { id: 1, title: 'Cafeteria Food', body: 'The food is cold.', author: 'Anonymous', date: new Date().toISOString() }
];

const blogs = [
    { id: 1, title: 'Welcome to Vani', body: 'This is the start of our community.', author: 'Alice Student', date: new Date().toISOString() }
];

const sosAlerts = [];

// New: Elections Data
const elections = [
    {
        id: 1,
        title: 'Class Representative 2025',
        description: 'Vote for your class representative.',
        options: [
            { id: 'opt1', text: 'John Doe', votes: 5 },
            { id: 'opt2', text: 'Jane Smith', votes: 8 }
        ],
        status: 'active'
    }
];

module.exports = { users, feedback, blogs, sosAlerts, elections };

// File: data.js
// In-memory mock database

// Mock Users
const users = [
    { id: 1, name: 'Alice Student', role: 'Student', karma: 120 },
    { id: 2, name: 'Dr. Bob Professor', role: 'Professor', karma: 50 },
    { id: 3, name: 'Charlie Rebel', role: 'Student', karma: 85 },
    { id: 4, name: 'Dana Scholar', role: 'Student', karma: 200 },
    { id: 5, name: 'Heidi Hacker', role: 'Student', karma: 210 },
    { id: 6, name: 'Grace Coder', role: 'Student', karma: 180 },
    { id: 7, name: 'Eve Artist', role: 'Student', karma: 150 },
    { id: 8, name: 'Liam Music', role: 'Student', karma: 140 },
    { id: 9, name: 'Judy Law', role: 'Student', karma: 130 },
    { id: 10, name: 'Ivan Gamer', role: 'Student', karma: 110 },
    { id: 11, name: 'Frank Jock', role: 'Student', karma: 95 },
    { id: 12, name: 'Kevin Cook', role: 'Student', karma: 70 }
];

// Storage arrays
// Combined Feedback/Posts
const posts = [
    { 
        id: 1, 
        title: 'Cafeteria Food', 
        body: 'The food is cold and expensive. We need better options!', 
        author: 'Anonymous', 
        date: new Date().toISOString(),
        upvotes: 15,
        downvotes: 2,
        type: 'complaint',
        votedBy: []
    },
    { 
        id: 2, 
        title: 'Library Hours', 
        body: 'Can we keep the library open until midnight during exam week?', 
        author: 'Dana Scholar', 
        date: new Date().toISOString(),
        upvotes: 45,
        downvotes: 0,
        type: 'suggestion',
        votedBy: []
    },
    { 
        id: 3, 
        title: 'Campus Wi-Fi', 
        body: 'The Wi-Fi in the Science Block is non-existent. Please fix it!', 
        author: 'Charlie Rebel', 
        date: new Date().toISOString(),
        upvotes: 32,
        downvotes: 1,
        type: 'complaint',
        votedBy: []
    },
    { 
        id: 4, 
        title: 'Annual Tech Fest', 
        body: 'We should invite industry leaders for the upcoming Tech Fest.', 
        author: 'Alice Student', 
        date: new Date().toISOString(),
        upvotes: 28,
        downvotes: 0,
        type: 'suggestion',
        votedBy: []
    },
    { 
        id: 5, 
        title: 'Parking Space', 
        body: 'Students are parking in faculty spots. It is chaos!', 
        author: 'Dr. Bob Professor', 
        date: new Date().toISOString(),
        upvotes: 10,
        downvotes: 5,
        type: 'rant',
        votedBy: []
    }
];

const sosAlerts = [];

// Elections/Polls Data
const elections = [
    {
        id: 1,
        title: 'Sports Coordinator Election',
        description: 'Vote for the Sports Coordinator.',
        options: [
            { id: 'opt1', text: 'Alex Striker', votes: 15 },
            { id: 'opt2', text: 'Jordan Dunk', votes: 12 }
        ],
        status: 'active',
        type: 'election',
        votedBy: []
    },
    {
        id: 2,
        title: 'Arts Coordinator Election',
        description: 'Vote for the Arts Coordinator.',
        options: [
            { id: 'opt1', text: 'Leonardo Paint', votes: 20 },
            { id: 'opt2', text: 'Vincent Sketch', votes: 18 }
        ],
        status: 'active',
        type: 'election',
        votedBy: []
    },
    {
        id: 3,
        title: 'Canteen Menu Change',
        description: 'Should we replace Taco Tuesday with Pizza Friday?',
        options: [
            { id: 'opt1', text: 'Yes, Pizza!', votes: 20 },
            { id: 'opt2', text: 'No, Tacos 4 Life', votes: 12 }
        ],
        status: 'active',
        type: 'poll',
        votedBy: []
    },
    {
        id: 3,
        title: 'Campus Chairman Election',
        description: 'Who should lead the Student Union?',
        options: [
            { id: 'opt1', text: 'Michael Scott', votes: 45 },
            { id: 'opt2', text: 'Dwight Schrute', votes: 40 },
            { id: 'opt3', text: 'Jim Halpert', votes: 60 }
        ],
        status: 'active',
        type: 'election',
        votedBy: []
    },
    {
        id: 4,
        title: 'Vice Chairman Election',
        description: 'Select your Vice Chairman.',
        options: [
            { id: 'opt1', text: 'Pam Beesly', votes: 55 },
            { id: 'opt2', text: 'Angela Martin', votes: 30 }
        ],
        status: 'active',
        type: 'election',
        votedBy: []
    },
    {
        id: 5,
        title: 'General Secretary Election',
        description: 'Vote for the General Secretary.',
        options: [
            { id: 'opt1', text: 'Oscar Martinez', votes: 50 },
            { id: 'opt2', text: 'Kevin Malone', votes: 48 }
        ],
        status: 'active',
        type: 'election',
        votedBy: []
    }
];

module.exports = { users, posts, sosAlerts, elections };


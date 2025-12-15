require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Post = require('./models/Post');
const Election = require('./models/Election');
const SOS = require('./models/SOS');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'chaos_is_a_ladder_hackathon_secret'; // In prod, use .env
const MONGO_URI = 'mongodb://127.0.0.1:27017/voiceofcampus';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// --- MongoDB Connection & Seeding ---
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB (Voice of Campus)');
        seedDatabase();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

async function seedDatabase() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('🌱 Seeding Database with Rich Data...');
            const hashedPassword = await bcrypt.hash('password123', 10);

            // 1. Create Users (from data.js)
            const usersData = [
                { name: 'Alice Student', email: 'alice@example.com', role: 'student', karma: 120 },
                { name: 'Dr. Bob Professor', email: 'bob@example.com', role: 'professor', karma: 50 },
                { name: 'Charlie Rebel', email: 'charlie@example.com', role: 'student', karma: 85 },
                { name: 'Dana Scholar', email: 'dana@example.com', role: 'student', karma: 200 },
                { name: 'Heidi Hacker', email: 'heidi@example.com', role: 'student', karma: 210 },
                { name: 'Grace Coder', email: 'grace@example.com', role: 'student', karma: 180 },
                { name: 'Eve Artist', email: 'eve@example.com', role: 'student', karma: 150 },
                { name: 'Liam Music', email: 'liam@example.com', role: 'student', karma: 140 },
                { name: 'Judy Law', email: 'judy@example.com', role: 'student', karma: 130 },
                { name: 'Ivan Gamer', email: 'ivan@example.com', role: 'student', karma: 110 },
                { name: 'Frank Jock', email: 'frank@example.com', role: 'student', karma: 95 },
                { name: 'Kevin Cook', email: 'kevin@example.com', role: 'student', karma: 70 }
            ];

            const createdUsers = [];
            for (const u of usersData) {
                const user = await User.create({ ...u, password: hashedPassword });
                createdUsers.push(user);
            }
            console.log('✅ Users Created');

            // 2. Create Posts
            const postsData = [
                { 
                    title: 'Cafeteria Food', 
                    body: 'The food is cold and expensive. We need better options!', 
                    author: 'Anonymous', 
                    isAnonymous: true,
                    upvotes: 15,
                    downvotes: 2,
                    type: 'complaint'
                },
                { 
                    title: 'Library Hours', 
                    body: 'Can we keep the library open until midnight during exam week?', 
                    author: 'Dana Scholar', 
                    authorId: createdUsers.find(u => u.name === 'Dana Scholar')._id,
                    upvotes: 45,
                    downvotes: 0,
                    type: 'suggestion'
                },
                { 
                    title: 'Campus Wi-Fi', 
                    body: 'The Wi-Fi in the Science Block is non-existent. Please fix it!', 
                    author: 'Charlie Rebel', 
                    authorId: createdUsers.find(u => u.name === 'Charlie Rebel')._id,
                    upvotes: 32,
                    downvotes: 1,
                    type: 'complaint'
                },
                { 
                    title: 'Annual Tech Fest', 
                    body: 'We should invite industry leaders for the upcoming Tech Fest.', 
                    author: 'Alice Student', 
                    authorId: createdUsers.find(u => u.name === 'Alice Student')._id,
                    upvotes: 28,
                    downvotes: 0,
                    type: 'suggestion'
                },
                { 
                    title: 'Parking Space', 
                    body: 'Students are parking in faculty spots. It is chaos!', 
                    author: 'Dr. Bob Professor', 
                    authorId: createdUsers.find(u => u.name === 'Dr. Bob Professor')._id,
                    upvotes: 10,
                    downvotes: 5,
                    type: 'rant'
                }
            ];
            await Post.insertMany(postsData);
            console.log('✅ Posts Created');

            // 3. Create Elections
            const electionsData = [
                {
                    title: 'Sports Coordinator Election',
                    description: 'Vote for the Sports Coordinator.',
                    options: [
                        { id: 'opt1', text: 'Alex Striker', votes: 15 },
                        { id: 'opt2', text: 'Jordan Dunk', votes: 12 }
                    ],
                    type: 'election'
                },
                {
                    title: 'Arts Coordinator Election',
                    description: 'Vote for the Arts Coordinator.',
                    options: [
                        { id: 'opt1', text: 'Leonardo Paint', votes: 20 },
                        { id: 'opt2', text: 'Vincent Sketch', votes: 18 }
                    ],
                    type: 'election'
                },
                {
                    title: 'Canteen Menu Change',
                    description: 'Should we replace Taco Tuesday with Pizza Friday?',
                    options: [
                        { id: 'opt1', text: 'Yes, Pizza!', votes: 20 },
                        { id: 'opt2', text: 'No, Tacos 4 Life', votes: 12 }
                    ],
                    type: 'poll'
                },
                {
                    title: 'Campus Chairman Election',
                    description: 'Who should lead the Student Union?',
                    options: [
                        { id: 'opt1', text: 'Michael Scott', votes: 45 },
                        { id: 'opt2', text: 'Dwight Schrute', votes: 40 },
                        { id: 'opt3', text: 'Jim Halpert', votes: 60 }
                    ],
                    type: 'election'
                },
                {
                    title: 'Vice Chairman Election',
                    description: 'Select your Vice Chairman.',
                    options: [
                        { id: 'opt1', text: 'Pam Beesly', votes: 55 },
                        { id: 'opt2', text: 'Angela Martin', votes: 30 }
                    ],
                    type: 'election'
                },
                {
                    title: 'General Secretary Election',
                    description: 'Vote for the General Secretary.',
                    options: [
                        { id: 'opt1', text: 'Oscar Martinez', votes: 50 },
                        { id: 'opt2', text: 'Kevin Malone', votes: 48 }
                    ],
                    type: 'election'
                }
            ];
            await Election.insertMany(electionsData);
            console.log('✅ Elections Created');

            // 4. SOS Logs
            await SOS.create([
                { author: 'Charlie Rebel', location: 'Chemistry Lab (Fire?)', timestamp: new Date(Date.now() - 10000000) },
                { author: 'Alice Student', location: 'Elevator stuck, Building B', timestamp: new Date(Date.now() - 5000000) }
            ]);
            console.log('✅ SOS Logs Created');
        }
    } catch (err) {
        console.error('Seed Error:', err);
    }
}

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// --- API Routes ---

// 0. Auth Routes
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: 'User not found' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid password' });

        // Create Token
        const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ 
            token, 
            user: { name: user.name, role: user.role, karma: user.karma, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    try {
        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 1. Posts Routes (The Wall)
app.get('/api/posts', authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
    const { title, body, isAnonymous, type } = req.body;
    
    const newPost = new Post({
        title,
        body,
        author: isAnonymous ? 'Anonymous' : req.user.name,
        authorId: req.user.id,
        isAnonymous,
        type: type || 'general'
    });

    try {
        await newPost.save();
        
        // Award Karma
        if (!isAnonymous) {
            await User.findByIdAndUpdate(req.user.id, { $inc: { karma: 10 } });
        }
        
        res.status(201).json({ message: 'Post submitted', data: newPost });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/posts/:id/vote', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // 'up' or 'down'
    const userName = req.user.name;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.votedBy.includes(userName)) {
            return res.status(400).json({ message: 'You have already voted.' });
        }

        if (type === 'up') {
            post.upvotes++;
            // Award karma to author if not anonymous
            if (!post.isAnonymous && post.authorId) {
                await User.findByIdAndUpdate(post.authorId, { $inc: { karma: 5 } });
            }
        } else {
            post.downvotes++;
        }

        post.votedBy.push(userName);
        await post.save();
        res.json({ message: 'Voted', data: post });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const users = await User.find().sort({ karma: -1 }).limit(10).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. SOS Routes
app.get('/api/sos', authenticateToken, async (req, res) => {
    try {
        const alerts = await SOS.find().sort({ timestamp: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/sos', authenticateToken, async (req, res) => {
    const { location } = req.body;
    
    const newAlert = new SOS({
        author: req.user.name,
        location: location || 'Unknown Location'
    });

    try {
        await newAlert.save();
        console.log(`[SOS ALERT] Triggered by ${req.user.name}`);
        res.status(201).json({ message: 'SOS Alert Triggered!', data: newAlert });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Elections
app.get('/api/elections', authenticateToken, async (req, res) => {
    try {
        const elections = await Election.find();
        res.json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/elections', authenticateToken, async (req, res) => {
    // Only professors can create elections
    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Only professors can create elections.' });
    }

    const { title, description, options, type } = req.body;
    // options is "opt1, opt2"
    const optionsArray = options.split(',').map((opt, idx) => ({
        id: `opt${idx}`,
        text: opt.trim(),
        votes: 0
    }));

    const newElection = new Election({
        title,
        description,
        options: optionsArray,
        type: type || 'poll'
    });

    try {
        await newElection.save();
        res.status(201).json({ message: 'Poll created', data: newElection });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/elections/vote', authenticateToken, async (req, res) => {
    const { electionId, optionId } = req.body;
    const userName = req.user.name;

    try {
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ message: 'Election not found' });

        if (election.votedBy.includes(userName)) {
            return res.status(400).json({ message: 'You have already voted.' });
        }

        const option = election.options.find(o => o.id === optionId);
        if (!option) return res.status(404).json({ message: 'Option not found' });

        option.votes++;
        election.votedBy.push(userName);
        await election.save();
        res.json({ message: 'Vote recorded', data: election });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/elections/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Only professors can delete elections.' });
    }

    try {
        const election = await Election.findByIdAndDelete(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        res.json({ message: 'Election deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Chatbot (OpenRouter)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Voice of Campus"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.2-3b-instruct:free",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are EMO BOY, a campus chatbot who is humorous, slightly dramatic, but deeply emotionally supportive. You use slang, emojis, and sometimes act a bit 'emo' (emotional/moody) but always with the goal of helping the student. You are a safe space for students to vent. Keep responses concise and engaging."
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const botReply = data.choices?.[0]?.message?.content || "I'm feeling a bit disconnected right now... 💔";
        res.json({ response: botReply });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ response: "My emotional circuits are overloaded... (Server Error) 😭" });
    }
});

app.listen(PORT, () => {
    console.log(`VOICE OF CAMPUS Server running on http://localhost:${PORT}`);
});
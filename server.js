// File: server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { users, posts, sosAlerts, elections } = require('./data');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (index.html, style.css)

// --- API Routes ---

// Get all users (for login simulation)
app.get('/api/users', (req, res) => {
    res.json(users);
});

// 1. Posts Routes (The Wall)
// GET: Fetch all posts
app.get('/api/posts', (req, res) => {
    // Sort by date desc
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedPosts);
});

// POST: Submit new post
app.post('/api/posts', (req, res) => {
    const { title, body, isAnonymous, authorName, type } = req.body;
    
    const newPost = {
        id: posts.length + 1,
        title,
        body,
        author: isAnonymous ? 'Anonymous' : authorName,
        date: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        type: type || 'general',
        votedBy: []
    };
    
    posts.push(newPost);
    
    // Award Karma to author if not anonymous
    if (!isAnonymous) {
        const user = users.find(u => u.name === authorName);
        if (user) user.karma = (user.karma || 0) + 10; // Posting gives karma
    }

    res.status(201).json({ message: 'Post submitted', data: newPost });
});

// POST: Vote on a post
app.post('/api/posts/:id/vote', (req, res) => {
    const { id } = req.params;
    const { type, userName } = req.body; // 'up' or 'down', userName required
    
    const post = posts.find(p => p.id == id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Initialize votedBy if not exists (for old data)
    if (!post.votedBy) post.votedBy = [];

    if (post.votedBy.includes(userName)) {
        return res.status(400).json({ message: 'You have already voted on this post.' });
    }

    if (type === 'up') {
        post.upvotes++;
        // Award karma to author
        if (post.author !== 'Anonymous') {
            const user = users.find(u => u.name === post.author);
            if (user) user.karma = (user.karma || 0) + 5;
        }
    } else if (type === 'down') {
        post.downvotes++;
        // Deduct karma? Maybe not for now to be nice.
    }

    post.votedBy.push(userName);
    res.json({ message: 'Voted', data: post });
});

// 2. Leaderboard Route
app.get('/api/leaderboard', (req, res) => {
    const sortedUsers = [...users].sort((a, b) => (b.karma || 0) - (a.karma || 0));
    res.json(sortedUsers);
});

// 3. SOS Routes
// GET: Fetch SOS logs
app.get('/api/sos', (req, res) => {
    res.json(sosAlerts);
});

// POST: Trigger SOS
app.post('/api/sos', (req, res) => {
    const { authorName, location } = req.body;
    
    const newAlert = {
        id: sosAlerts.length + 1,
        author: authorName, // Always identified
        location: location || 'Unknown Location',
        timestamp: new Date().toISOString()
    };
    
    sosAlerts.push(newAlert);
    console.log(`[SOS ALERT] Triggered by ${authorName}`);
    res.status(201).json({ message: 'SOS Alert Triggered!', data: newAlert });
});

// 4. Elections/Polls Routes
app.get('/api/elections', (req, res) => {
    res.json(elections);
});

app.post('/api/elections', (req, res) => {
    const { title, description, options, type } = req.body;
    // options is a string "opt1, opt2"
    const optionsArray = options.split(',').map((opt, idx) => ({
        id: `opt${idx}`,
        text: opt.trim(),
        votes: 0
    }));

    const newElection = {
        id: elections.length + 1,
        title,
        description,
        options: optionsArray,
        status: 'active',
        type: type || 'poll',
        votedBy: []
    };
    elections.push(newElection);
    res.status(201).json({ message: 'Poll created', data: newElection });
});

// POST: Vote in election
app.post('/api/elections/vote', (req, res) => {
    const { electionId, optionId, userName } = req.body;
    const election = elections.find(e => e.id == electionId);
    
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Initialize votedBy if not exists
    if (!election.votedBy) election.votedBy = [];

    if (election.votedBy.includes(userName)) {
        return res.status(400).json({ message: 'You have already voted in this election.' });
    }

    const option = election.options.find(o => o.id === optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });
    
    option.votes++;
    election.votedBy.push(userName);
    res.json({ message: 'Vote recorded', data: election });
});

// DELETE: Remove an election (Professor only)
app.delete('/api/elections/:id', (req, res) => {
    const { id } = req.params;
    const index = elections.findIndex(e => e.id == id);
    
    if (index === -1) return res.status(404).json({ message: 'Election not found' });
    
    elections.splice(index, 1);
    res.json({ message: 'Election removed successfully' });
});

// 5. Chatbot Routes (AI Assistant)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Voice of Campus"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
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
        if (data.error) {
             console.error("OpenRouter API Error:", data.error);
             throw new Error(data.error.message || "API Error");
        }
        const botReply = data.choices?.[0]?.message?.content || "I'm feeling a bit disconnected right now... try again later. 💔";
        
        res.json({ response: botReply });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ response: "My emotional circuits are overloaded... (Server Error) 😭" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`VOICE OF CAMPUS Server running on http://localhost:${PORT}`);
});

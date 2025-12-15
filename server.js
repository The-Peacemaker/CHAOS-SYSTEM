// File: server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { users, feedback, blogs, sosAlerts, elections } = require('./data');

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

// 1. Feedback Routes
// GET: Fetch all feedback
app.get('/api/feedback', (req, res) => {
    res.json(feedback);
});

// POST: Submit new feedback
app.post('/api/feedback', (req, res) => {
    const { title, body, isAnonymous, authorName } = req.body;
    
    const newFeedback = {
        id: feedback.length + 1,
        title,
        body,
        author: isAnonymous ? 'Anonymous' : authorName,
        date: new Date().toISOString()
    };
    
    feedback.push(newFeedback);
    res.status(201).json({ message: 'Feedback submitted', data: newFeedback });
});

// 2. Blog Routes
// GET: Fetch all blogs
app.get('/api/blog', (req, res) => {
    res.json(blogs);
});

// POST: Submit new blog post
app.post('/api/blog', (req, res) => {
    const { title, body, authorName } = req.body;
    
    const newBlog = {
        id: blogs.length + 1,
        title,
        body,
        author: authorName, // Always identified
        date: new Date().toISOString()
    };
    
    blogs.push(newBlog);
    res.status(201).json({ message: 'Blog posted', data: newBlog });
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

// 5. Chatbot Routes (Princi Kuttan)
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    
    // Simple "AI" Logic
    const responses = [
        "DISCIPLINE IS THE BRIDGE BETWEEN GOALS AND ACCOMPLISHMENT.",
        "IS THIS RELEVANT TO YOUR ACADEMICS?",
        "I HEAR YOU. NOW GET BACK TO CLASS.",
        "INTERESTING. SUBMIT A REPORT ON MY DESK.",
        "EMOTIONS ARE VALID. BUT ATTENDANCE IS MANDATORY.",
        "SILENCE IN THE HALLWAY!",
        "I WILL CONSIDER THIS REQUEST. MAYBE.",
        "FOCUS, STUDENT. FOCUS.",
        "WHY ARE YOU NOT STUDYING?",
        "HMM. NOTED."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
        res.json({ response: randomResponse });
    }, 1000); // Artificial delay for "thinking"
});

// 4. Election Routes
// GET: Fetch active elections
app.get('/api/elections', (req, res) => {
    res.json(elections);
});

// POST: Create new election (Professor only)
app.post('/api/elections', (req, res) => {
    const { title, description, options } = req.body;
    // options should be an array of strings, we convert to objects
    const formattedOptions = options.map((opt, idx) => ({
        id: `opt${idx}`,
        text: opt,
        votes: 0
    }));

    const newElection = {
        id: elections.length + 1,
        title,
        description,
        options: formattedOptions,
        status: 'active'
    };
    
    elections.push(newElection);
    res.status(201).json({ message: 'Election created', data: newElection });
});

// POST: Vote
app.post('/api/elections/vote', (req, res) => {
    const { electionId, optionId } = req.body;
    const election = elections.find(e => e.id == electionId);
    
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    const option = election.options.find(o => o.id === optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });
    
    option.votes++;
    res.json({ message: 'Vote recorded', data: election });
});

// 5. Chatbot Routes (Princi Kuttan)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    console.log(`[DEBUG] Received chat message: "${message}"`);
    const msgLower = message ? message.toLowerCase() : "";
    
    // Check API Key Status
    const apiKey = process.env.GEMINI_API_KEY;
    const hasApiKey = apiKey && apiKey !== 'YOUR_API_KEY_HERE';
    
    console.log(`[DEBUG] API Key Present: ${!!apiKey}, Length: ${apiKey ? apiKey.length : 0}, Start: ${apiKey ? apiKey.substring(0, 4) : 'N/A'}`);

    // Try Gemini API
    try {
        if (hasApiKey) {
            console.log("Using Gemini AI for response...");
            const genAI = new GoogleGenerativeAI(apiKey);
            // Updated model name - gemini-pro is deprecated
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `You are Princi Kuttan, an extremely strict, old-school, and unintentionally funny Indian college principal. 
            
            Traits:
            - You hate romance, long hair, mobile phones, and fun.
            - You are obsessed with attendance, discipline, and "bringing your parents".
            - You speak in ALL CAPS.
            - You are roasting a student who said: "${message}".
            
            Response rules:
            - Be savage but appropriate for a principal.
            - SPECIFICALLY MOCK the details of their message so they know you heard them.
            - Mention things like "suspension", "ID card", "haircut", or "parents".
            - Keep it under 30 words.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log("Gemini Response:", text);
            return res.json({ response: text });
        } else {
            console.log("No valid API Key found. Using Fallback Mock Logic.");
        }
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        // Show quota/rate limit errors to the user
        if (error.message.includes('quota') || error.message.includes('429')) {
            return res.json({ response: `[QUOTA EXCEEDED] Your Gemini API free tier is exhausted. Please wait or upgrade your API plan. Using fallback mode.` });
        }
        return res.json({ response: `[API ERROR] ${error.message.substring(0, 100)}...` });
    }

    // Fallback Mock Logic (Keyword Based)
    let response = "SILENCE! GET OUT OF MY OFFICE!";

    if (msgLower.includes('love') || msgLower.includes('crush') || msgLower.includes('date')) {
        response = "NO ROMANCE ON CAMPUS! BRING YOUR FATHER TOMORROW!";
    } else if (msgLower.includes('food') || msgLower.includes('hungry') || msgLower.includes('canteen')) {
        response = "YOU COME HERE TO EAT OR STUDY? GET OUT!";
    } else if (msgLower.includes('exam') || msgLower.includes('fail') || msgLower.includes('study')) {
        response = "IF YOU WROTE ANSWERS INSTEAD OF LOVE LETTERS, YOU WOULD PASS!";
    } else if (msgLower.includes('sad') || msgLower.includes('depressed') || msgLower.includes('cry')) {
        response = "EMOTIONS ARE FOR ARTS STUDENTS. GO STUDY MATHS!";
    } else if (msgLower.includes('hair') || msgLower.includes('beard')) {
        response = "IS THAT A HAIRSTYLE OR A BIRD'S NEST? CUT IT IMMEDIATELY!";
    } else if (msgLower.includes('phone') || msgLower.includes('mobile')) {
        response = "GIVE ME THAT PHONE! COLLECT IT AFTER 4 YEARS!";
    } else {
        const randomResponses = [
            "IS THIS RELEVANT TO YOUR ATTENDANCE?",
            "DO YOU WANT SUSPENSION?",
            "WHERE IS YOUR ID CARD?!",
            "WHY ARE YOU ROAMING IN THE CORRIDOR?",
            "I WILL CALL YOUR PARENTS.",
            "DISCIPLINE IS ZERO! ZERO!"
        ];
        response = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }
    
    setTimeout(() => {
        res.json({ response: response });
    }, 500); 
});

// Start Server
app.listen(PORT, () => {
    console.log(`Vani Server running on http://localhost:${PORT}`);
});

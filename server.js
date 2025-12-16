require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

// Initialize Firebase Admin
// EXPECTS serviceAccountKey.json in the root directory OR FIREBASE_SERVICE_ACCOUNT env var
let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (parseError) {
            console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT env var');
        }
    }
}

if (serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Connected to Firebase Firestore');
    } catch (error) {
        console.error('❌ Firebase Initialization Error:', error.message);
    }
} else {
    console.error('❌ Firebase Initialization Error: Missing serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT env var.');
}

const db = admin.apps.length ? admin.firestore() : null;

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chaos_is_a_ladder_hackathon_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Helper to map Firestore doc to object with _id
const mapDoc = (doc) => {
    if (!doc.exists) return null;
    const data = doc.data();
    return { _id: doc.id, ...data };
};

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
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    const { email, password } = req.body;
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();
        
        if (snapshot.empty) return res.status(400).json({ message: 'User not found' });

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid password' });

        // Create Token
        const token = jwt.sign({ id: userDoc.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ 
            token, 
            user: { name: user.name, role: user.role, karma: user.karma, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    const { name, email, password, role } = req.body;
    
    try {
        // Check if user exists
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        
        if (!snapshot.empty) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            karma: 0
        };

        await usersRef.add(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 1. Posts Routes (The Wall)
app.get('/api/posts', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef.orderBy('date', 'desc').get();
        const posts = snapshot.docs.map(mapDoc);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    const { title, body, isAnonymous, type } = req.body;
    
    const newPost = {
        title,
        body,
        author: isAnonymous ? 'Anonymous' : req.user.name,
        authorId: req.user.id,
        isAnonymous,
        type: type || 'general',
        upvotes: 0,
        downvotes: 0,
        votedBy: [],
        date: new Date().toISOString()
    };

    try {
        const docRef = await db.collection('posts').add(newPost);
        const savedPost = await docRef.get();
        
        // Award Karma
        if (!isAnonymous) {
            const userRef = db.collection('users').doc(req.user.id);
            await userRef.update({ karma: admin.firestore.FieldValue.increment(10) });
        }
        
        res.status(201).json({ message: 'Post submitted', data: mapDoc(savedPost) });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/posts/:id/vote', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    const { id } = req.params;
    const { type } = req.body; // 'up' or 'down'
    const userName = req.user.name;

    try {
        const postRef = db.collection('posts').doc(id);
        const postDoc = await postRef.get();
        
        if (!postDoc.exists) return res.status(404).json({ message: 'Post not found' });

        const postData = postDoc.data();

        if (postData.votedBy && postData.votedBy.includes(userName)) {
            return res.status(400).json({ message: 'You have already voted.' });
        }

        const updates = {
            votedBy: admin.firestore.FieldValue.arrayUnion(userName)
        };

        if (type === 'up') {
            updates.upvotes = admin.firestore.FieldValue.increment(1);
            // Award karma to author if not anonymous
            if (!postData.isAnonymous && postData.authorId) {
                const authorRef = db.collection('users').doc(postData.authorId);
                await authorRef.update({ karma: admin.firestore.FieldValue.increment(5) });
            }
        } else {
            updates.downvotes = admin.firestore.FieldValue.increment(1);
        }

        await postRef.update(updates);
        
        // Return updated doc
        const updatedDoc = await postRef.get();
        res.json({ message: 'Voted', data: mapDoc(updatedDoc) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.orderBy('karma', 'desc').limit(10).get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            delete data.password;
            return { _id: doc.id, ...data };
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. SOS Routes
app.get('/api/sos', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    try {
        const sosRef = db.collection('sos');
        const snapshot = await sosRef.orderBy('timestamp', 'desc').get();
        const alerts = snapshot.docs.map(mapDoc);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/sos', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    const { location } = req.body;
    
    const newAlert = {
        author: req.user.name,
        location: location || 'Unknown Location',
        timestamp: new Date().toISOString()
    };

    try {
        const docRef = await db.collection('sos').add(newAlert);
        const savedAlert = await docRef.get();
        console.log(`[SOS ALERT] Triggered by ${req.user.name}`);
        res.status(201).json({ message: 'SOS Alert Triggered!', data: mapDoc(savedAlert) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Elections
app.get('/api/elections', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    try {
        const electionsRef = db.collection('elections');
        const snapshot = await electionsRef.get();
        const elections = snapshot.docs.map(mapDoc);
        res.json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/elections', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
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

    const newElection = {
        title,
        description,
        options: optionsArray,
        type: type || 'poll',
        status: 'active',
        votedBy: []
    };

    try {
        const docRef = await db.collection('elections').add(newElection);
        const savedElection = await docRef.get();
        res.status(201).json({ message: 'Poll created', data: mapDoc(savedElection) });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/elections/vote', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    const { electionId, optionId } = req.body;
    const userName = req.user.name;

    try {
        const electionRef = db.collection('elections').doc(electionId);
        const electionDoc = await electionRef.get();
        
        if (!electionDoc.exists) return res.status(404).json({ message: 'Election not found' });

        const electionData = electionDoc.data();

        if (electionData.votedBy && electionData.votedBy.includes(userName)) {
            return res.status(400).json({ message: 'You have already voted.' });
        }

        const options = electionData.options;
        const optionIndex = options.findIndex(o => o.id === optionId);
        
        if (optionIndex === -1) return res.status(404).json({ message: 'Option not found' });

        // Increment votes for the option
        options[optionIndex].votes++;

        await electionRef.update({
            options: options,
            votedBy: admin.firestore.FieldValue.arrayUnion(userName)
        });

        const updatedDoc = await electionRef.get();
        res.json({ message: 'Vote recorded', data: mapDoc(updatedDoc) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/elections/:id', authenticateToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Only professors can delete elections.' });
    }

    try {
        await db.collection('elections').doc(req.params.id).delete();
        res.json({ message: 'Election deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Chatbot (OpenRouter with Fallback)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    // Fallback responses for when API is down (Hackathon Survival Mode)
    const fallbackResponses = [
        "Sigh... the digital void is loud today. But I hear you. 🖤",
        "I'm feeling a bit disconnected from the mainframe... but your vibe is valid. 🥀",
        "That's heavy. Like, My Chemical Romance heavy. 🎸",
        "The wifi of my soul is lagging, but I'm sending you good energy. 💀",
        "Just staring at the loading screen of life thinking about that. 🌑",
        "I can't reach the cloud right now (it's too sunny), but I support you. ☁️",
        "Error 404: Motivation not found... jk, I'm here. What else is up? 💔"
    ];

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
                "model": "nousresearch/hermes-3-llama-3.1-405b:free",
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
        
        const botReply = data.choices?.[0]?.message?.content;
        if (!botReply) throw new Error("No content received");

        res.json({ response: botReply });

    } catch (error) {
        console.error("AI Error (Switching to Fallback):", error.message);
        
        // Return a random fallback response instead of crashing
        const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        res.json({ response: randomFallback });
    }
});

// Export app for Vercel
module.exports = app;

// Only listen if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`VOICE OF CAMPUS Server running on http://localhost:${PORT}`);
    });
}

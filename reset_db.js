const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Election = require('./models/Election');
const SOS = require('./models/SOS');
const { users, posts, elections, sosAlerts } = require('./data');

const MONGO_URI = 'mongodb://127.0.0.1:27017/voiceofcampus';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🗑️  Clearing Database...');
        await User.deleteMany({});
        await Post.deleteMany({});
        await Election.deleteMany({});
        await SOS.deleteMany({});
        console.log('✨ Database Cleared');

        console.log('🌱 Seeding Database from data.js...');
        
        // 1. Create Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const createdUsers = [];
        
        for (const u of users) {
            // Generate a fake email if not present
            const email = u.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '@example.com';
            // Map role to lowercase to match enum ['student', 'professor']
            const role = u.role.toLowerCase();
            
            const user = await User.create({
                name: u.name,
                email: email,
                password: hashedPassword,
                role: role,
                karma: u.karma
            });
            createdUsers.push(user);
        }
        console.log(`✅ ${createdUsers.length} Users Created`);

        // 2. Create Posts
        const postsData = posts.map(p => {
            const authorUser = createdUsers.find(u => u.name === p.author);
            return {
                title: p.title,
                body: p.body,
                author: p.author,
                authorId: authorUser ? authorUser._id : null,
                isAnonymous: p.author === 'Anonymous',
                type: p.type,
                upvotes: p.upvotes,
                downvotes: p.downvotes,
                date: p.date
            };
        });
        await Post.insertMany(postsData);
        console.log(`✅ ${postsData.length} Posts Created`);

        // 3. Create Elections
        // Ensure options structure matches schema
        const electionsData = elections.map(e => ({
            title: e.title,
            description: e.description,
            options: e.options,
            status: e.status,
            type: e.type
        }));
        await Election.insertMany(electionsData);
        console.log(`✅ ${electionsData.length} Elections Created`);

        // 4. Create SOS (if any)
        if (sosAlerts && sosAlerts.length > 0) {
            await SOS.insertMany(sosAlerts);
            console.log(`✅ ${sosAlerts.length} SOS Alerts Created`);
        }

        console.log('✨ Database Seeded Successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

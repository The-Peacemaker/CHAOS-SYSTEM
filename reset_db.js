const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const { users, posts, elections, sosAlerts } = require('./data');

// Initialize Firebase Admin
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔥 Connected to Firebase Firestore');
} catch (error) {
    console.error('❌ Firebase Initialization Error: Missing serviceAccountKey.json or invalid credentials.');
    process.exit(1);
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

async function seed() {
    try {
        console.log('🗑️  Clearing Database...');
        await deleteCollection('users', 100);
        await deleteCollection('posts', 100);
        await deleteCollection('elections', 100);
        await deleteCollection('sos', 100);
        console.log('✨ Database Cleared');

        console.log('🌱 Seeding Database from data.js...');

        // 1. Create Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const createdUsers = []; // Store { name: ..., id: ... }

        const userBatch = db.batch();
        
        for (const u of users) {
            const email = u.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '@example.com';
            const role = u.role.toLowerCase();
            
            const userRef = db.collection('users').doc(); // Auto-ID
            const userData = {
                name: u.name,
                email: email,
                password: hashedPassword,
                role: role,
                karma: u.karma
            };
            
            userBatch.set(userRef, userData);
            createdUsers.push({ ...userData, id: userRef.id });
        }
        await userBatch.commit();
        console.log(`✅ ${createdUsers.length} Users Created`);

        // 2. Create Posts
        const postBatch = db.batch();
        for (const p of posts) {
            const authorUser = createdUsers.find(u => u.name === p.author);
            const postRef = db.collection('posts').doc();
            const postData = {
                title: p.title,
                body: p.body,
                author: p.author,
                authorId: authorUser ? authorUser.id : null,
                isAnonymous: p.author === 'Anonymous',
                type: p.type,
                upvotes: p.upvotes,
                downvotes: p.downvotes,
                votedBy: [],
                date: p.date
            };
            postBatch.set(postRef, postData);
        }
        await postBatch.commit();
        console.log(`✅ ${posts.length} Posts Created`);

        // 3. Create Elections
        const electionBatch = db.batch();
        for (const e of elections) {
            const electionRef = db.collection('elections').doc();
            const electionData = {
                title: e.title,
                description: e.description,
                options: e.options,
                status: e.status,
                type: e.type,
                votedBy: []
            };
            electionBatch.set(electionRef, electionData);
        }
        await electionBatch.commit();
        console.log(`✅ ${elections.length} Elections Created`);

        // 4. Create SOS
        if (sosAlerts && sosAlerts.length > 0) {
            const sosBatch = db.batch();
            for (const s of sosAlerts) {
                const sosRef = db.collection('sos').doc();
                sosBatch.set(sosRef, s);
            }
            await sosBatch.commit();
            console.log(`✅ ${sosAlerts.length} SOS Alerts Created`);
        }

        console.log('✨ Database Seeded Successfully');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();

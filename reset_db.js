const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Election = require('./models/Election');
const SOS = require('./models/SOS');

const MONGO_URI = 'mongodb://127.0.0.1:27017/voiceofcampus';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🗑️  Clearing Database...');
        await User.deleteMany({});
        await Post.deleteMany({});
        await Election.deleteMany({});
        await SOS.deleteMany({});
        console.log('✨ Database Cleared');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

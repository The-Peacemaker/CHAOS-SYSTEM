const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: String, required: true }, // Storing name for simplicity in display
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional link to real user
    isAnonymous: { type: Boolean, default: false },
    type: { type: String, enum: ['general', 'complaint', 'suggestion', 'rant'], default: 'general' },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    votedBy: [{ type: String }], // Array of user names or IDs who voted
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
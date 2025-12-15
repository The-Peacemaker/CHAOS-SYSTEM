const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    id: String,
    text: String,
    votes: { type: Number, default: 0 }
});

const electionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    options: [optionSchema],
    status: { type: String, default: 'active' },
    type: { type: String, default: 'poll' },
    votedBy: [{ type: String }] // Array of user names/IDs
});

module.exports = mongoose.model('Election', electionSchema);
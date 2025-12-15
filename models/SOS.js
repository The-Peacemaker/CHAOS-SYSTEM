const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
    author: { type: String, required: true },
    location: { type: String, default: 'Unknown Location' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SOS', sosSchema);
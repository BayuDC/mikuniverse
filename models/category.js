const mongoose = require('mongoose');

module.exports = mongoose.model('Category', {
    name: String,
    channel: String,
    nsfw: Boolean,
});

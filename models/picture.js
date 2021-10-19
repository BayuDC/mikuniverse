const mongoose = require('mongoose');

module.exports = mongoose.model('Picture', {
    url: String,
    message: String,
    category: String,
});

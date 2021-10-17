const mongoose = require('mongoose');

module.exports = mongoose.model('Picture', {
    url: String,
    category: String,
});

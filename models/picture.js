const mongoose = require('mongoose');

module.exports = mongoose.model('Picture', {
    url: String,
    sauce: String,
    message: String,
    category: String,
});

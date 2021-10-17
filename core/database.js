const mongoose = require('mongoose');
const mongouri = process.env.MONGO_URI;

mongoose.connect(mongouri).then('Connected to database');

const mongoose = require('mongoose');
const mongouri = process.env.MONGO_URI;

mongoose.connect(mongouri).then(() => console.log('Connected to database'));

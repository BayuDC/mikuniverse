const express = require('express');
const app = express();

if (process.env.NODE_ENV != 'production') {
    app.use(require('morgan')('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require('../routes/home'));
app.use((req, res) => res.sendStatus(404));

module.exports = app;

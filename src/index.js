const express = require('express');
const morgan = require('morgan');
const path = require('path');

// Initializing the server
const app = express();

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Global Variables
app.use((req, res, next) => {

    next();
});

// Routes
app.use(require('./routes/index'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
app.listen(app.get('port'), ()=> {
    console.log(`Server on port: ${app.get('port')}`);
});
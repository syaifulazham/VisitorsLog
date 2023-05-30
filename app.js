
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

const express = require('express');
const path = require('path');
const session = require('express-session');

var indexRouter = require('./routes/index');

const passport = require('passport');

const app = express();

// Set up the EJS view engine
app.set('view engine', 'ejs');
app.set('views', './views');


// Set up the routes
app.get('/', (req, res) => {
    res.render('index', {title: 'Log Pelawat'});
});
  

app.listen(3001, function() {
    console.log('Server started on port 3001');
});
  
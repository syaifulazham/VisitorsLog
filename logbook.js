
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

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// Set up the routes
//app.get('/', (req, res) => {
//    res.render('index', {title: 'Log Pelawat'});
//});

app.use(bodyParser.urlencoded({
    extended: true
}));
  
  // parse application/json
app.use(bodyParser.json());

app.listen(3080, function() {
    console.log('Server started on port 3080');
});
  
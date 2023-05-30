var express = require('express');
const session = require('express-session');

var router = express.Router();

router.get('/', (req,res)=>{
    res.render('index.ejs', {title: 'Log Pelawat'});
});
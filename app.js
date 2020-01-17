// Dependencies
var express=require("express");
var app = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var mongo = require('mongodb');
var assert = require('assert');

var ejs = require('ejs'); // important view engine 

// Init App
var app = express();
app.set('port', (process.env.PORT || 3000));

var server=app.listen(app.get('port'), function(){
  console.log('Server started on port '+app.get('port'));
});

app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// BodyParser Middleware
// used for handlebars data rendering with server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Rendering pages

// Main Landing Page
app.get('/',function(req,res,next){
  res.render('index');
});


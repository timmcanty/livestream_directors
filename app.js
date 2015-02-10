var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var director = require('./app/models/director');

var app = express();

//Add routes
require('./routes')(app);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/27018')

var db = mongoose.connection;

module.exports = app;

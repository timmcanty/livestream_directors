var express = require('express');
var directors = require('./app/controllers/directors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

module.exports = function (app) {

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.param('id', directors.load);


  app.route('/directors')
    .get(directors.index)
    .post(directors.create);


  app.route('/directors/:id')
    .get(directors.show)
    .put(directors.update);

  // catch 404 and respond
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    res.status(404);
    res.json('Page not found')
  });


}

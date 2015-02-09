var mongoose = require('mongoose');
var Director = mongoose.model('Director');
var request = require('request');

// Livestream URL
var livestreamUrl = 'https://api.new.livestream.com/accounts/';


exports.load = function (req,res,next, id) {
  Director.findOne({ _id: id}, function (err, director) {
    if (err) { return next(err); }
    if (!director) { return next(new Error('Director not found')); }
    req.director = director;
    next();
  });
};

exports.index = function (req,res,next) {
  Director.find( function (err, directors) {
    if (err) {
      return console.error(err);
    } else {
      res.json(directors);
    }
  });
};

exports.show = function (req,res,next) {
  res.json(req.director);
};

exports.create = function (req, res, next) {
  if (req.body.livestream_id) {
    request({
      url: livestreamUrl + req.body.livestream_id,
      json: true
    }, function (error, response, body) {
      if (error) {
        return next(error);
      } else {
        var director = new Director( {
          livestream_id: req.body.livestream_id,
          full_name: body.full_name,
          dob: body.dob,
          favorite_camera: '',
          favorite_moves: []
        });
        director.save( function (err, director) {
          if (err) { return next(error)};
          res.json(director);
        });
      }
    });
  } else {
    return next(new Error('Livestream_ID param missing'));
  }
};

exports.update = function (req, res, next) {
  var director = req.director;
  var authorization = req.headers['authorization'];

  if (!director.isAuthorized(authorization)) {
    res.json({'error': 'must be authorized to edit'});
  } else {

    if (req.body.favorite_camera) {
      director.favorite_camera = req.body.favorite_camera;
    }

    if (req.body.favorite_movies) {
      director.favorite_movies = req.body.favorite_movies;
    }

    director.save( function (err, director) {
      if (err) { next(err);}
      res.json(director);
    });
  }
};

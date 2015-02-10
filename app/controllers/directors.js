var mongoose = require('mongoose');
var Director = mongoose.model('Director');
var request = require('request');

// Livestream URL
var livestreamUrl = 'https://api.new.livestream.com/accounts/';


exports.load = function (req,res,next, id) {
  Director.findOne({ _id: id}, function (err, director) {
    if (err) { res.json('Invalid Director ID'); }
    if (!director) { res.json('Director not found'); }
    req.director = director;
    next();
  });
};

exports.index = function (req,res,next) {
  Director.find( function (err, directors) {
    if (err) {
      res.json(err);
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
        console.log('1');
        res.status(503);
        res.json('Unable to connect to Livestream API');
      } else {
        var director = new Director( {
          livestream_id: req.body.livestream_id,
          full_name: body.full_name,
          dob: body.dob,
          favorite_camera: '',
          favorite_moves: []
        });
        director.save( function (err, director) {
          if (err) {
            res.status(422);
            if (err.name == 'MongoError') {
              res.json('Account already created!');
            } else {
              res.json('No Livestream Account is Associated with this ID');
            }
          }
          res.json(director);
        });
      }
    });
  } else {
    console.log('3');
    res.status(400);
    res.json('Livestream ID required!');
  }
};

exports.update = function (req, res, next) {
  var director = req.director;
  var authorization = req.headers['authorization'];

  if (!director.isAuthorized(authorization)) {
    res.json('Must be authorized to edit');
  } else {

    if (req.body.favorite_camera) {
      if (req.body.favorite_camera instanceof String) {
        director.favorite_camera = req.body.favorite_camera;
      } else {
        res.status(422);
        res.json('favorite_camera must be a string');
        return;
      }
    }

    if (req.body.favorite_movies) {
      if (req.body.favorite_moves instanceof Array) {
        director.favorite_movies = req.body.favorite_movies;
      } else {
        res.status(422);
        res.json('favorite_movies must be an array');
        return;
      }

    }

    director.save( function (err, director) {
      if (err) {
        res.status(422);
        res.json('Director failed to save');
      }
      res.json(director);
    });
  }
};

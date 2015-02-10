var mongoose = require('mongoose');
var Director = mongoose.model('Director');
var request = require('request');

// Livestream URL
var livestreamUrl = 'https://api.new.livestream.com/accounts/';

// Error Rendering

function sendError (statusCode, message, res) {
  res.status(statusCode);
  res.json(message);
};


exports.load = function (req,res,next, id) {
  Director.findOne({ _id: id}, function (err, director) {
    if (err) { sendError(500, 'Failure communicating with Mongo', res); }
    if (!director) { sendError(400, 'Director not found', res); }
    req.director = director;
    next();
  });
};

exports.index = function (req,res,next) {
  Director.find( function (err, directors) {
    if (err) {
      sendError(500, 'Failure communicating with Mongo', res);
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
        sendError(503, 'Unable to connect to Livestream API', res);
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
            sendError(422, (err.name == 'MongoError' ? 'Account already created!' : 'No LS Account Associated with ID'), res)
          }
          res.json(director);
        });
      }
    });
  } else {
    sendError(400,'Livestream ID required!', res);
  }
};

exports.update = function (req, res, next) {
  var director = req.director;
  var authorization = req.headers['authorization'];

  if (!director.isAuthorized(authorization)) {
    sendError(401, 'Must be authorized to edit', res);
  } else {

    if (req.body.favorite_camera) {

      if (typeof req.body.favorite_camera ===  'string') {
        director.favorite_camera = req.body.favorite_camera;
      } else {
        sendError(422, 'favorite_camera must be a string!', res);
        return;
      }
    }

    if (req.body.favorite_movies) {
      if ([].slice.call(req.body.favorite_movies) instanceof Array) {
        director.favorite_movies = req.body.favorite_movies;
      } else {
        sendError(422, 'favorite_movies must be an array!', res);
        return;
      }

    }

    director.save( function (err, director) {
      if (err) {
        sendError(422, 'Director failed to save!', res);
      }
      res.json(director);
    });
  }
};

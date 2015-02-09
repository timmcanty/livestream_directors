var mongoose = require('mongoose');
var Director = mongoose.model('Director');
var request = require('request');

// Livestream URL
var livestreamUrl = 'https://api.new.livestream.com/accounts/';


exports.load = function (req,res,next, id) {
  Director.load(id, function (err, article) {
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

exports.show = function (req,res,next, id) {
  res.json(req.article);
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

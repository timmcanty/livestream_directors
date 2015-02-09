var mongoose = require('mongoose');

var directorSchema = mongoose.Schema({
  full_name: { type: String, required: true, index: {unique: true}},
  livestream_id: { type: Number, required: true, index: {unique: true}},
  dob: Date,
  favorite_camera: String,
  favorite_movies: []
});

var Director = mongoose.model('Director', directorSchema);

module.exports = Director;

var mongoose = require('mongoose');
var md5 = require('MD5');

var directorSchema = mongoose.Schema({
  full_name: { type: String, required: true, index: {unique: true}},
  livestream_id: { type: Number, required: true, index: {unique: true}},
  dob: Date,
  favorite_camera: String,
  favorite_movies: []
});

directorSchema.methods.isAuthorized = function (authString) {
  var encryptedString = authString;
  var authPieces = encryptedString.split(' ');
  if (authPieces[0] != 'Bearer') {
    return false;
  }
  if (md5(this.full_name) != authPieces[1]) {
    return false;
  }
  return true;
};

var Director = mongoose.model('Director', directorSchema);

module.exports = Director;

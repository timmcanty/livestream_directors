var dbURI = 'mongodb://localhost/test';
var mongoose = require("mongoose");
var director = require("../app/models/director");
var request = require('supertest');
var express = require('express');
var clearDB = require('mocha-mongoose')(dbURI);
var assert = require("assert");
var md5 = require("MD5");

var app = express();
require('../routes')(app);

mongoose.connect(dbURI);

// Clear test DB
director.collection.remove(function(){});


// used vars
var cameron = {"livestream_id" : "6488824" };
var scorsese = { "livestream_id" : "6488818" };
var spielberg = { "livestream_id" : "6488834"};
var badJSON = "";
var nonAccount = { "livestream_id" : "-5" };

var goodEdit = { "favorite_camera" : "Nikon", "favorite_movies" : [ "Jaws", "Jaws 2"] };
var badEdit = { "_id" : "ohno", "favorite_camera" : ["arr","stuff"], "favorite_movies" : { "bad" : "form"} };

describe('POST /directors', function () {


  it('Handles proper registration requests', function (done) {
    request(app)
      .post('/directors')
      .send(scorsese)
      .expect(200)
      .end( function (err ,res) {
        if (err) { return done(err);}
        var directors = director.find({}, function (err, directors) {
          if (err) { done(err);}
          assert.equal(directors.length, 1);
          done();
        });
      });
  });

  it('Rejects multiple registrations for the same livestream account', function (done) {
    request(app)
      .post('/directors')
      .send(scorsese)
      .end( function (err,res) {
        request(app)
          .post('/directors')
          .send(scorsese)
          .expect(422)
          .end( function (err,res) { done();});
      });
  });

  it('Handles nonexistent livestream IDs', function (done) {

    request(app)
      .post('/directors')
      .send(nonAccount)
      .expect(422)
      .end( function (err,res) {
        if (err) { done(err); }
        done();
      });
  });

  it('Handles badly formed JSON', function (done) {
    request(app)
      .post('/directors')
      .send(badJSON)
      .expect(400)
      .end( function (err, res) {
        if (err) { return done(err);}
        done();
      });
  });

});

describe('GET /directors', function () {

  it('Responds with json', function (done) {
    request(app)
      .get('/directors')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) { return done(err);}
        done()
      });
  });

  it('Responds with all directors', function (done) {
    request(app)
      .post('/directors')
      .send(scorsese)
      .end(function(){
        request(app)
        .post('/directors')
        .send(cameron)
        .end(function (err, res) {
          request(app)
          .get('/directors')
          .end(function (err, res) {
            assert.equal(res.body.length,2);
            done();
          });
        });
    });
  });
});

describe('PUT /directors', function (done) {


  it('Requires validation', function(done) {
    request(app)
      .post('/directors')
      .send(scorsese)
      .end(function(err, res) {
        var id = res.body._id;
        request(app)
          .put('/directors/' + id)
          .send(goodEdit)
          .expect(401)
          .end( function (err, res) {
            done();
          });
      });
  });

  it('Successfully updates directors', function (done) {
    request(app)
      .post('/directors')
      .send(scorsese)
      .end( function(err, res) {
        var id = res.body._id
        request(app)
          .put('/directors/' + id)
          .send(goodEdit)
          .set('Authorization', 'Bearer ' + md5(res.body.full_name))
          .expect(200)
          .end( function (err,res) {
            assert.equal(res.body.favorite_camera, 'Nikon');
            assert.equal(res.body.favorite_movies[1], 'Jaws 2');
            done();
          })
      })
  });

  it('Handles poorly constructed updates', function (done) {
    request(app)
      .post('/directors')
      .send(scorsese)
      .end( function (err,res) {
        var id = res.body._id;
        request(app)
          .put('/directors/' + id)
          .send(badEdit)
          .set('Authorization', 'Bearer ' + md5(res.body.full_name))
          .expect(422)
          .end( function (err,res) {
            done();
          })
      })
  });
});

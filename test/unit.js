var Lab = require('lab'),
    Joi = require('joi'),
    _ = require('underscore'),
    lab = exports.lab = Lab.script(),
    server = require('../index.js'),
    places = server.places;




lab.experiment('Places endpoint', function() {

  lab.test('lists all places', function(done) {
    var options = {
      method: 'GET',
      url: '/places'
    };

    var placeSchema = Joi.object().keys({
      name: Joi.string().required(),
      geo: Joi.array().includes(Joi.number().min(0).max(180)).length(2).required(),
      users: Joi.array().includes(Joi.string()),
      website: Joi.string()
    }),
    resultSchema = Joi.array().includes(placeSchema).min(1);

    server.inject(options, function(response) {
      var result = response.result;

      Lab.expect(response.statusCode).to.equal(200);
      Joi.assert(result, resultSchema);

      done();
    });
  });

  lab.test('can add user to place', function(done) {
    var options = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: 'Max'}
    }

    server.inject(options, function(response) {
      Lab.expect(response.statusCode).to.equal(200);
      Lab.expect(places[1].users).to.contain('Max');

      done();
    });
  });

  lab.test('allows user to change place', function(done) {
    var options = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: 'Max'}
    }

    places[2].users = ['Max'];

    server.inject(options, function(response) {
      var placesAttendedByMax = _.filter(places, function(place) {
        if(place.users) {
          return _.contains(place.users, 'Max');
        }
        return false;
      });
      Lab.expect(response.statusCode).to.equal(200);
      Lab.expect(places[1].users).to.contain('Max');
      Lab.expect(placesAttendedByMax).length.to.be(1);

      done();
    });
  });

  lab.test('rejects POST requests to a place with invalid payload format', function(done) {
    var nonStringUser = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: {a: 'foo'}}
    }

    server.inject(nonStringUser, function(response) {
      Lab.expect(response.statusCode).to.equal(400);

      done()
    });
  });

  lab.test('allows user to withdraw', function(done) {
    var options = {
      method: 'POST',
      url: '/places',
      payload: {user: 'Max', action: 'withdraw'}
    }

    places[7].users = ['Max'];

    server.inject(options, function(response) {
      Lab.expect(places[7].users).to.not.contain('Max');

      done();
    });
  });

  lab.test('rejects POST requests to places with invalid payload format', function(done) {
    var nonStringUser = {
      method: 'POST',
      url: '/places',
      payload: {user: 'Max'}
    }

    server.inject(nonStringUser, function(response) {
      Lab.expect(response.statusCode).to.equal(400);

      done();
    });
  });

});

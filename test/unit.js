var Lab = require('lab'),
    Joi = require('joi'),
    Code = require('code'),
    _ = require('underscore'),
    lab = exports.lab = Lab.script(),
    indexjs = require('../index.js'),
    server = indexjs.server,
    places = indexjs.places;


lab.experiment('Places endpoint', function() {

    var timeSlotSchema = Joi.object().keys({
      time: Joi.valid('11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00'),
      users: Joi.array().includes(Joi.string())
    }),

    placeSchema = Joi.object().keys({
      name: Joi.string().required(),
      geo: Joi.array().includes(Joi.number().min(0).max(180)).length(2).required(),
      time_slots: Joi.array().includes(timeSlotSchema),
      website: Joi.string(),
      tags: Joi.array().includes(Joi.string()),
      distance: Joi.number()
    }),

    resultSchema = Joi.array().includes(placeSchema).min(1);

  lab.test('lists all places', function(done) {
    var options = {
      method: 'GET',
      url: '/places'
    };

    places[0].time_slots = [{ time: '12:15', users: ['max', 'Moritz']}];


    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Joi.assert(result, resultSchema);

      done();
    });
  });

  lab.test('can add user to place', function(done) {
    var options = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: 'max', time_slot: '12:15'}
    };

    server.inject(options, function(response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(places[1].findTimeSlot('12:15').users).to.contain('max');

      done();
    });
  });

  lab.test('allows user to change place', function(done) {
    var options = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: 'max', time_slot: '12:45'}
    };

    places[2].time_slots = [{ time: '12:00', users: ['max']}];

    server.inject(options, function(response) {
      var timesmaxIsPresent = 0;
      _.each(places, function(place) {
        if(place.hasOwnProperty('time_slots')) {
          _.each(place.time_slots, function(timeSlot) {
            _.each(timeSlot.users, function(user) {
              if(user === 'max') timesmaxIsPresent++;
            })
          })
        }
      });
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(places[1].findTimeSlot('12:45').users).to.contain('max');
      Code.expect(timesmaxIsPresent).to.equal(1);

      done();
    });
  });

  lab.test('rejects POST requests to a place with invalid payload format', function(done) {
    var nonStringUser = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: {a: 'foo'}}
    };

    server.inject(nonStringUser, function(response) {
      Code.expect(response.statusCode).to.equal(400);

      done()
    });
  });

  lab.test('allows user to withdraw', function(done) {
    var options = {
      method: 'POST',
      url: '/places',
      payload: {user: 'max', action: 'withdraw'}
    };

    places[7].time_slots = [{time: '11:45', users: ['max']}];

    server.inject(options, function(response) {
      Code.expect(places[7].findTimeSlot('11:45')).to.equal(undefined);

      done();
    });
  });

  lab.test('rejects POST requests to places with invalid payload format', function(done) {
    var invalidPayload = {
      method: 'POST',
      url: '/places',
      payload: {user: 'max'}
    };

    server.inject(invalidPayload, function(response) {
      Code.expect(response.statusCode).to.equal(400);

      done();
    });
  });
});

lab.experiment('invalid payloads', function() {

  var invalidUserNames = ['TooLong', 'ab'];

  _.each(invalidUserNames, function(name) {
    lab.test('reject POST requests with invalid user name "' + name + '"', function(done) {
      var request = {
        method: 'POST',
        url: '/places',
        payload: {user: name, action: 'withdraw'}
      };
      server.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });
    });
  });

});

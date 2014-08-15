var Lab = require('lab'),
    Joi = require('joi'),
    _ = require('underscore'),
    lab = exports.lab = Lab.script(),
    server = require('../index.js'),
    places = server.places;


lab.experiment('Cron job', function() {
  lab.test('initPlaces should remove all users', function(done) {
    server.places[0].users = ['Max'];

    server.initPlaces();

    Lab.expect(server.places[0].hasOwnProperty('users')).to.equal(false)
    done();
  });
});

lab.experiment('Places endpoint', function() {

    var usersSchema = Joi.array().includes(Joi.string()),

    timeSlotSchema = Joi.object().keys({
      '11:30': usersSchema,
      '11:45': usersSchema,
      '12:00': usersSchema,
      '12:15': usersSchema,
      '12:30': usersSchema,
      '12:45': usersSchema,
      '13:00': usersSchema
    }),

    placeSchema = Joi.object().keys({
      name: Joi.string().required(),
      geo: Joi.array().includes(Joi.number().min(0).max(180)).length(2).required(),
      time_slots: timeSlotSchema,
      website: Joi.string()
    }),

    resultSchema = Joi.array().includes(placeSchema).min(1);

  lab.test('lists all places', function(done) {
    var options = {
      method: 'GET',
      url: '/places'
    };

    server.places[0].time_slots = {'12:15': ['Max', 'Moritz']};


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
      payload: {user: 'Max', time_slot: '12:15'}
    }

    server.inject(options, function(response) {
      Lab.expect(response.statusCode).to.equal(200);
      Lab.expect(places[1].time_slots['12:15']).to.contain('Max');

      done();
    });
  });

  lab.test('allows user to change place', function(done) {
    var options = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: 'Max', time_slot: '12:45'}
    }

    places[2].time_slots = {'12:00': ['Max']};

    server.inject(options, function(response) {
      var timesMaxIsPresent = 0;
      _.each(places, function(place) {
        if(place.hasOwnProperty('time_slots')) {
          for(var timeSlot in place.time_slots){
            _.each(place.time_slots[timeSlot], function(user) {
              if(user === 'Max') timesMaxIsPresent++;
            })
          }
        }
      });
      Lab.expect(response.statusCode).to.equal(200);
      Lab.expect(places[1].time_slots['12:45']).to.contain('Max');
      Lab.expect(timesMaxIsPresent).to.equal(1);

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

    places[7].time_slots = {'11:45': ['Max']};

    server.inject(options, function(response) {
      Lab.expect(places[7].time_slots['11:45']).to.not.contain('Max');

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

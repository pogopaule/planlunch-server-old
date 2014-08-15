var Lab = require('lab'),
    Joi = require('joi'),
    _ = require('underscore'),
    lab = exports.lab = Lab.script(),
    server = require('../index.js'),
    places = server.places;


lab.experiment('Cron job', function() {
  lab.test('initPlaces should remove all time_slots', function(done) {
    server.places[0].time_slots = [{ time: '12:15', users: ['Max', 'Moritz']}];

    server.initPlaces();

    Lab.expect(server.places[0].hasOwnProperty('time_slots')).to.equal(false)
    done();
  });
});

lab.experiment('Places endpoint', function() {

    var timeSlotSchema = Joi.object().keys({
      time: Joi.valid('11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00'),
      users: Joi.array().includes(Joi.string())
    }),

    placeSchema = Joi.object().keys({
      name: Joi.string().required(),
      geo: Joi.array().includes(Joi.number().min(0).max(180)).length(2).required(),
      time_slots: Joi.array().includes(timeSlotSchema),
      website: Joi.string()
    }),

    resultSchema = Joi.array().includes(placeSchema).min(1);

  lab.test('lists all places', function(done) {
    var options = {
      method: 'GET',
      url: '/places'
    };

    server.places[0].time_slots = [{ time: '12:15', users: ['Max', 'Moritz']}];


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
      Lab.expect(places[1].findTimeSlot('12:15').users).to.contain('Max');

      done();
    });
  });

  lab.test('allows user to change place', function(done) {
    var options = {
      method: 'POST',
      url: '/places/Café%20Einstein',
      payload: {user: 'Max', time_slot: '12:45'}
    }

    places[2].time_slots = [{ time: '12:00', users: ['Max']}];

    server.inject(options, function(response) {
      var timesMaxIsPresent = 0;
      _.each(places, function(place) {
        if(place.hasOwnProperty('time_slots')) {
          _.each(place.time_slots, function(timeSlot) {
            _.each(timeSlot.users, function(user) {
              if(user === 'Max') timesMaxIsPresent++;
            })
          })
        }
      });
      Lab.expect(response.statusCode).to.equal(200);
      Lab.expect(places[1].findTimeSlot('12:45').users).to.contain('Max');
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

    places[7].time_slots = [{time: '11:45', users: ['Max']}];

    server.inject(options, function(response) {
      Lab.expect(places[7].findTimeSlot('11:45')).to.equal(undefined);

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

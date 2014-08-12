var Hapi = require('hapi'),
    _ = require('underscore'),
    Joi = require('joi'),
    CronJob = require('cron').CronJob;



new CronJob('0 0 14 * * 1-5', function(){
  initPlaces();
}, null, true, 'Europe/Berlin');





var port = process.env.PORT || 8080;
var server = new Hapi.Server(port, {cors: true});

server.route({
  method: 'GET',
  path: '/places',
  handler: function(request, reply) {
    reply(server.places);
  }
});

server.route({
  method: 'POST',
  path: '/places',
  config: {
    validate: {
      payload: Joi.object().keys({
        attendee: Joi.string().required(),
        action: Joi.string().required()
      })
    }
  },
  handler: function(request, reply) {
    if(request.payload.action === 'withdraw') {
      removeAttendeeFromPlaces(request.payload.attendee);
    }
    reply();
  }
});

server.route({
  method: 'POST',
  path: '/places/{name}',
  config: {
    validate: {
      payload: Joi.object().keys({
        attendee: Joi.string().required()
      })
    }
  },
  handler: function(request, reply) {
    var attendee = request.payload.attendee;
    removeAttendeeFromPlaces(attendee);
    addAttendeeToPlace(attendee, request.params.name);

    reply();
  }
});

initPlaces();

if(!isTest()) {
  server.start(function() {
    console.log('server started', server.info.uri);
  });
}






function isTest() {
  return module.parent;
}

function removeAttendeeFromPlaces(attendee) {
  var placeAttendedByAttendee = _.each(server.places, function(place) {
    if(place.attendees) {
      place.attendees = _.without(place.attendees, attendee);
    }
  });
}

function addAttendeeToPlace(attendee, placeName) {
  var place = _.find(server.places, function(place) {
    return place.name === placeName
  });

  if(!place.attendees) {
    place.attendees = [];
  }

  place.attendees.push(attendee);
}

function initPlaces() {
  server.places = [
    { name: 'Anuras Elefant', geo: [47.9949945, 7.8373675]},
    { name: 'Café Einstein', geo: [47.9986877, 7.8396364], website: 'http://www.cafe-einstein.de/wochenkarte/' },
    { name: 'Curryhaus', geo: [47.9995368, 7.8386085], website: 'http://www.curryhaus-freiburg.com/index.php/angebote' },
    { name: 'Lila Bar', geo: [47.9939093, 7.8419898], website: 'http://www.lilabar-freiburg.de/karte/mittagstisch/' },
    { name: 'Amara Schlemmer Stüble', geo: [47.9968696, 7.8351075], website: 'https://de-de.facebook.com/pages/Amara-Schlemmer-St%C3%BCble/363697680397151' },
    { name: 'Café Huber', geo: [47.9973051, 7.839442], website: 'https://www.facebook.com/CafeHuber' },
    { name: 'Brasil', geo: [47.9982693, 7.8362522], website: 'http://www.brasil-freiburg.de/mittagstisch.php' },
    { name: 'mensadrei', geo: [47.994701, 7.848078], website: 'http://mensadrei.de/karte' },
    { name: 'Euphrat', geo: [47.994794, 7.8479557], website: 'https://de-de.facebook.com/pages/Orientalische-Speisen-im-Euphrat/142416882448701' },
    { name: 'Leaf Thaiküche', geo: [47.9975493, 7.8445847], website: 'http://www.leafthaiküche.de/mittagstisch.php' },
    { name: 'Jos Fritz Café', geo: [47.9944926, 7.8415117], website: 'http://www.josfritzcafe.de/frame.html' },
    { name: 'Café Sedan', geo: [47.9950339, 7.8430912]},
    { name: 'Inxmail Küche', geo: [47.9956715, 7.8386571], website: '' },
    { name: 'Der Geier', geo: [47.9940068, 7.8412263], website: 'http://www.bodega-dergeier.de/was-gibts-zu-essen/' },
    { name: 'Inxmail Dachterrase', geo: [47.99518, 7.83837]},
    { name: 'Mai Sushi', geo: [47.9959956, 7.8440229], website: 'http://www.maisushi.de/speisekarte-freiburg.php' },
    { name: 'Mai Wok', geo: [47.9960166, 7.8439047], website: 'http://www.maiwok-freiburg.de/Home/uploads/Ger_Menu_MW.pdf' },
    { name: 'Stühlingerpark', geo: [47.99666, 7.83839]},
    { name: 'Kartoffelhaus', geo: [47.9880838, 7.8463505], website: 'http://www.daskartoffelhaus.de/fileadmin/user_upload/Speisekarten/Das_Kartoffelhaus_Mittagstisch.pdf' },
    { name: 'la Centrale', geo: [47.9937667, 7.8336526], website: 'http://www.centrale-ewerk.de/index.php/bistro' },
    { name: 'Corosol', geo: [47.9947838, 7.8346218], website: 'https://de-de.facebook.com/cafecorosol' },
    { name: 'Pizzaria Ochsebrugg', geo: [47.9979355, 7.8402287], website: 'http://www.pizzeria-ochsebrugg.de/speisekate.html' },
    { name: 'Café Pow', geo: [], website: 'https://www.facebook.com/cafepow' }
  ];
}

module.exports = server;

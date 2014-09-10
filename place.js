var _ = require('underscore');

var Place = function(name, geo, website, tags, distance) {
  this.name = name;
  this.geo = geo;
  this.website = website;
  this.tags = tags;
  this.distance = distance;
}

Place.prototype.findTimeSlot = function(time) {
  return _.find(this.time_slots, function(timeSlot) {
     return timeSlot.time === time;
  });
}

Place.prototype.removeUser = function(user) {
  if(this.time_slots) {
    _.each(this.time_slots, function(timeSlot, index, timeSlots) {
      timeSlot.users = _.without(timeSlot.users, user);
      if(timeSlot.users.length == 0) {
        timeSlots.splice(index, 1);
      }
    });
  }
}

Place.prototype.addUser = function(user, time) {
  if(!this.time_slots) {
    this.time_slots = [];
  }

  if(!this.findTimeSlot(time)) {
    this.time_slots.push({time: time, users: []});
  }

  this.time_slots = _.sortBy(this.time_slots, function(timeSlot) {
    return timeSlot.time;
  })

  this.findTimeSlot(time).users.push(user);
}

module.exports = Place;

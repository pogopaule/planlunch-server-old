var CronJob = require('cron').CronJob;

new CronJob('0 0 14 * * 1-5', function(){
  server.initPlaces();
}, null, true, 'Europe/Berlin');


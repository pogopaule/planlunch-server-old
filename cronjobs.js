var CronJob = require('cron').CronJob;

module.exports = function(job) {
  return new CronJob('0 0 14 * * 1-5', function(){
    job();
  }, null, true, 'Europe/Berlin');
}


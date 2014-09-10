var CronJob = require('cron').CronJob;

module.exports = function(job) {
  return new CronJob('* * * * * 1-5', function(){
    job();
  }, null, true, 'Europe/Berlin');
}


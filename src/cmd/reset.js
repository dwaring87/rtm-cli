'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');


/**
 * This command removes any saved User information from the
 * config files.
 */
function action(args, env, callback) {
  config.user(function(user) {
    log.spinner.start("Clearing Task Index Cache...");
    user.clearTaskIndexCache();
    log.spinner.start("Rebuilding Task Index Cache...");
    user.tasks.get(function(err, tasks) {
      if ( err ) {
        log.spinner.error("Could not rebuild Task Index Cache");
      }
      else {
        log.spinner.success("Task Index Cache rebuilt");
      }
      return callback();
    });
  });
}


module.exports = {
  command: 'reset',
  description: 'Reset cached task indices',
  action: action
};
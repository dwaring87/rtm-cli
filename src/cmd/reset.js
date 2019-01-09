'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const parseFilter = require('../utils/filter.js');
const finish = require('../utils/finish.js');


/**
 * This command removes any saved User information from the
 * config files.
 */
function action(args, env) {
  config.user(function(user) {
    log.spinner.start("Clearing Task Index Cache...");
    user.clearTaskIndexCache();
    log.spinner.start("Rebuilding Task Index Cache...");
    user.tasks.get(parseFilter(), function(err) {
      if ( err ) {
        log.spinner.error("Could not rebuild Task Index Cache");
      }
      else {
        log.spinner.success("Task Index Cache rebuilt");
      }
      return finish();
    });
  });
}


module.exports = {
  command: 'reset',
  description: 'Reset cached task indices',
  action: action
};
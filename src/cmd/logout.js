'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');


/**
 * This command removes any saved User information from the
 * config files.
 */
function action(args, env, callback) {
  log.spinner.start('Logging Out...');
  config.removeUser();
  let c = config.get();
  if ( !c._user && !c.user ) {
    log.spinner.success('Logged Out');
  }
  else {
    log.spinner.error('Could not log out');
  }
  return callback();
}


module.exports = {
  command: 'logout',
  description: 'Remove RTM User information',
  action: action
};
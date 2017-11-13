'use strict';

const config = require('../utils/config.js');
const login = require('../utils/login.js');


/**
 * This command removes any existing User information from the
 * config files and starts the RTM auth process.  A successful
 * login will save the User information in the first default
 * config file.
 */
function action(args, env, callback) {
  config.removeUser();
  login(function() {
    return callback();
  });
}


module.exports = {
  command: 'login',
  description: 'Add RTM User information',
  action: action
};
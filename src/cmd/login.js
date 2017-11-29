'use strict';

const config = require('../utils/config.js');
const login = require('../utils/login.js');
const finish = require('../utils/finish.js');


/**
 * This command removes any existing User information from the
 * config files and starts the RTM auth process.  A successful
 * login will save the User information in the first default
 * config file.
 */
function action(args, env) {
  config.removeUser();
  login(function() {
    return finish();
  });
}


module.exports = {
  command: 'login',
  description: 'Add RTM User information',
  action: action,
  disableLogin: true
};
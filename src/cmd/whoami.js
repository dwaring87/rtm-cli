'use strict';

const config = require('../utils/config.js');
const finish = require('../utils/finish.js');
const log = require('../utils/log.js');


/**
 * This command displays the user information of the logged in
 * Remember the Milk account
 */
function action(args, env) {
  let user = config.get()._user;
  if ( user ) {
    log("RTM ID: " + user.id);
    log("Username: " + user.username);
    log("Full Name: " + user.fullname);
    log("RTM Auth Token: " + user.authToken);
  }
  else {
    log.spinner.error("No User Information Found");
    log.style("Use the ");
    log.style("login", "bgYellow.black");
    log.style(" command to login to RTM.");
    log();
  }
  finish();
}


module.exports = {
  command: 'whoami',
  description: 'Display RTM user information',
  action: action,
  disableLogin: true
};
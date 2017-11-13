'use strict';

const opn = require('opn');
const log = require('./log.js');
const config = require('./config.js');
const readline = require('readline');


/**
 * Get the logged in user.
 *
 * This will return the cached User or start the auth
 * process and return a new User.
 *
 * This will exit the process if the auth process fails.
 * @param callback Callback function(user)
 * @private
 */
function login(callback=function() {}) {
  let user = config.get()._user;
  if ( !user ) {
    _auth(function(err, user) {
      if ( err ) {
        log.spinner.error("ERROR: Could not login (" + err.msg + ")");
        process.exit(1);
      }
      return callback(user);
    });
  }
  else {
    return callback(user);
  }
}

/**
 * Start the auth process
 * @param callback
 * @private
 */
function _auth(callback) {
  let client = config.get()._client;

  log.info("Authorization Required:");

  // Get the Auth URL
  log.spinner.start('Getting Login URL...');
  client.auth.getAuthUrl(function(err, url, frob) {
    if ( err ) {
      log.spinner.error('Could not get Login URL');
      return callback(err);
    }
    log.spinner.stop();

    // Display the URL
    log('Please open the following URL and authorize RTM CLI:');
    log.style(url, 'blue.underline', true);

    // Open the URL in default browser
    opn(url);

    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Wait for User Input
    rl.question('Press [enter] when done:', function() {
      rl.close();
      log.spinner.start('Logging In...');

      // Get the Authorized User
      client.auth.getAuthToken(frob, function(err, user) {
        if ( err ) {
          log.spinner.error('Could not Log In');
          return callback(err);
        }

        // Display success
        log.spinner.success('Logged in as: ' + user.username);

        // Save the User to the config
        config.saveUser(user);

        // Return the User in the callback
        return callback(null, user);
      });
    });
  });
}


module.exports = login;
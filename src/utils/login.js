'use strict';

const cp = require('copy-paste');
const log = require('./log.js');
const finish = require('../utils/finish.js');


/**
 * Start the Login Process.
 *
 * This will save the logged in user to a configuration file.
 * @private
 */
function login(callback) {
  const config = require('./config.js');
  let client = config.client;

  log.info("Authorization Required:");

  // Get the Auth URL
  log.spinner.start('Getting Login URL...');
  client.auth.getAuthUrl(function(err, url, frob) {
    if ( err ) {
      log.spinner.error('Could not get Login URL (' + err.msg + ')');
      return finish();
    }
    log.spinner.stop();

    // Copy URL to clipboard
    cp.copy(url);

    // Display the URL
    log.style('Please open the following URL (');
    log.style('copied to clipboard', 'bold.underline');
    log.style(') and authorize RTM CLI:', true);
    log.style(url, 'blue.underline', true);

    // Wait for User Input
    global._rl.question('Press [enter] when done: ', function() {
      log.spinner.start('Logging In...');

      // Get the Authorized User
      client.auth.getAuthToken(frob, function(err, user) {
        if ( err ) {
          log.spinner.error('Could not Log In (' + err.msg + ')');
          return finish();
        }

        // Display success
        log.spinner.success('Logged in As: ' + user.username);

        // Save the User to the config
        config.saveUser(user);

        // Return the User
        if ( callback ) {
          return callback(user);
        }
        else {
          return finish();
        }

      });
    });
  });
}


module.exports = login;
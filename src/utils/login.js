'use strict';

const opn = require('opn');
const log = require('./log.js');


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
      process.exit(1);
    }
    log.spinner.stop();

    // Display the URL
    log('Please open the following URL and authorize RTM CLI:');
    log.style(url, 'blue.underline', true);

    // Open the URL in default browser
    opn(url);

    // Wait for User Input
    global._rl.question('Press [enter] when done:', function() {
      log.spinner.start('Logging In...');

      // Get the Authorized User
      client.auth.getAuthToken(frob, function(err, user) {
        if ( err ) {
          log.spinner.error('Could not Log In (' + err.msg + ')');
          process.exit(1);
        }

        // Display success
        log.spinner.success('Logged in as: ' + user.username);

        // Save the User to the config
        config.saveUser(user);

        // Return the User
        if ( callback ) {
          return callback(user);
        }
        else {
          process.exit(0);
        }

      });
    });
  });
}


module.exports = login;
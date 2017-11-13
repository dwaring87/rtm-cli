'use strict';

const opn = require('opn');
const log = require('./log.js');
const readline = require('readline');


/**
 * Start the Login Process.
 *
 * This will save the logged in user to a configuration file.
 * @private
 */
function login() {
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

    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Wait for User Input
    rl.question('Press [enter] when done:', function() {
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

        // Exit the Process
        rl.close();
        process.exit(0);
      });
    });
  });
}


module.exports = login;
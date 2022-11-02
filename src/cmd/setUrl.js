'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command displays a task url
 * @param args index
 * @param env
 */
function action(args, env) {

  // Prompt for task
  if ( args.length < 1 ) {
    prompt('Task:', 'URL:', _promptFinished);
  }

  // Use provided args
  else {
    _process(args[0], args[1]);
  }

}


/**
 * Process the returned answers
 * @private
 */
function _promptFinished(answers) {
  for ( let i = 0; i < answers.length; i++ ) {
    let answer = answers[i];
    _process(answer[0], answer[1],i+1, answers.length);
  }
}


/**
 * Process the request
 * @private
 */
function _process(index, url, count=1, max=1) {

  // Make sure URL starts with http
  if ( url === undefined || url === "" || url === " " ) {
    url = "";
  }
  else if ( ! (url.startsWith("http://") || url.startsWith("https://")) ) {
    url = "http://" + url;
  }

  // Display info
  log.spinner.start("Updating Task(s)...");

  // Get User
  config.user(function(user) {

    // Parse arguments
    index = parseInt(index.trim());

    // Set URL
    user.tasks.setURL(index, url, function(err) {
      if ( err ) {
        log.spinner.error("Could not set URL for Task #" + index + " (" + err.msg + ")");
      }
      _processFinished(count, max);
    });

  });

}

/**
 * Request Callback
 * @private
 */
function _processFinished(count, max) {
  log.spinner.start("Updating Task [" + count + "/" + max + "]...");

  // All tasks returned...
  if ( count === max ) {
    log.spinner.stop();
    return finish();
  }


}


module.exports = {
  command: 'setUrl [index] [url]',
  alias: 'su',
  description: 'Set the URL of a Task',
  action: action
};
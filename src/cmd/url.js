'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const prompt = require('../utils/prompt.js');
const finish = require('../utils/finish.js');


let URLS = [];


/**
 * This command displays a task url
 * @param args index
 * @param env
 */
function action(args, env) {

  // Reset URLs
  URLS = [];

  // Prompt for task
  if ( args.length < 1 ) {
    prompt('Task:', _promptFinished);
  }

  // Use provided args
  else {
    for ( let i = 0; i < args[0].length; i++ ) {
      _process(args[0][i], i+1, args[0].length);
    }
  }

}


/**
 * Process the returned answers
 * @private
 */
function _promptFinished(answers) {
  for ( let i = 0; i < answers.length; i++ ) {
    let answer = answers[i];
    _process(answer[0], i+1, answers.length);
  }
}


/**
 * Process the request
 * @private
 */
function _process(index, count=1, max=1) {

  // Display info
  log.spinner.start("Getting Task(s)...");

  // Get User
  config.user(function(user) {

    // Parse arguments
    index = parseInt(index.trim());

    // Get Task
    user.tasks.getTask(index, function(err, task) {
      if ( err ) {
        log.spinner.error("Could not get Task #" + index + " (" + err.msg + ")");
      }

      // Add URL
      else if ( task.url !== undefined ) {
        URLS.push({
          index: index,
          url: task.url
        });
      }

      // Finish
      _processFinished(count, max);

    });

  });

}

/**
 * Request Callback
 * @private
 */
function _processFinished(count, max) {
  log.spinner.start("Getting Task [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.stop();

    // Print URLs
    for ( let i = 0; i < URLS.length; i++ ) {
      console.log("[" + URLS[i].index + "] " + URLS[i].url)
    }

    return finish();
  }
}


module.exports = {
  command: 'url [index...]',
  description: 'Display the associated URL of a Task',
  action: action
};
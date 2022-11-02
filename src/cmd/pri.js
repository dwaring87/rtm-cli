'use strict';

const { prompt } = require('../utils/prompt.js');

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const finish = require('../utils/finish.js');


/**
 * This command updates the priority of 1 or more Tasks
 * @param args index priority
 * @param env
 */
function action(args, env) {

  // Process the given arguments
  if ( args.length === 2 ) {
    _process(args[0], args[1]);
  }

  // Prompt the User for the arguments
  else {
    prompt("Task:", "Priority:", _promptFinished);
  }

}


/**
 * Process the returned answers
 * @private
 */
function _promptFinished(answers) {
  for ( let i = 0; i < answers.length; i++ ) {
    let answer = answers[i];
    _process(answer[0], answer[1], i+1, answers.length);
  }
}


/**
 * Process the request
 * @private
 */
function _process(index, priority, count=1, max=1) {
  log.spinner.start("Setting Task Priority...");
  config.user(function(user) {
    index = parseInt(index.trim());
    priority = parseInt(priority.trim());

    // Update Priority
    user.tasks.priority(index, priority, function(err) {
      if ( err ) {
        log.spinner.error("Could not update Task #" + index + " (" + err.msg + ")");
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
  log.spinner.start("Setting Task Priority [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("Task(s) Updated");
    return finish();
  }
}




module.exports = {
  command: 'pri [index] [priority]',
  alias: 'p',
  description: 'Change Task Priority',
  action: action
};
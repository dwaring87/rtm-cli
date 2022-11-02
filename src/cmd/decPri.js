'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command decreases the priority of 1 or more Tasks
 * @param args indices...
 * @param env
 */
function action(args, env) {

  // Prompt for tasks
  if ( args.length === 0 ) {
    prompt('Task:', _promptFinished);
  }

  // Process Tasks
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
function _process(task, count=1, max=1) {
  log.spinner.start("Prioritizing Task(s)...");
  config.user(function(user) {
    task = parseInt(task.trim());

    // Decrease Priority
    user.tasks.decreasePriority(task, function(err) {
      if ( err ) {
        log.spinner.error("Could not decrease priority of Task #" + task + " (" + err.msg + ")");
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
  log.spinner.start("Prioritizing Task [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("Task(s) Prioritized");
    return finish();
  }
}


module.exports = {
  command: 'decPri [indices...]',
  alias: '-',
  description: 'Decrease the Priority of one or more Tasks',
  action: action
};
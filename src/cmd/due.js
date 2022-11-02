'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command sets the due date for a Task
 * @param args index due
 * @param env
 */
function action(args, env) {

  // Prompt for due date
  if ( args.length < 2 ) {
    prompt('Task:', 'Due:', _promptFinished);
  }

  // Use provided args
  else {
    _process(args[0], args[1].join(' '));
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
function _process(task, due, count=1, max=1) {
  log.spinner.start("Setting Due Date(s)...");
  config.user(function(user) {

    // Parse arguments
    task = parseInt(task.trim());
    due = due.trim();

    // Set Due Date
    user.tasks.setDueDate(task, due, function(err) {
      if ( err ) {
        log.spinner.error("Could not set due date for Task #" + task + " (" + err.msg + ")");
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
  log.spinner.start("Setting Due Date [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("Task(s) Updated");
    return finish();
  }
}


module.exports = {
  command: 'due [index] [due...]',
  description: 'Set the Due Date of a Task',
  action: action
};
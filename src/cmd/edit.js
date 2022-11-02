'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command changes the name of a Task
 * @param args index name
 * @param env
 */
function action(args, env) {

  // Prompt for name
  if ( args.length < 2 ) {
    prompt('Task:', 'Name:', _promptFinished);
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
function _process(task, name, count=1, max=1) {
  log.spinner.start("Updating Task(s)...");
  config.user(function(user) {

    // Parse arguments
    task = parseInt(task.trim());
    name = name.trim();

    // Set Name
    user.tasks.setName(task, name, function(err) {
      if ( err ) {
        log.spinner.error("Could not change name for Task #" + task + " (" + err.msg + ")");
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
  if ( count === max ) {
    log.spinner.success("Task(s) Updated");
    return finish();
  }
}


module.exports = {
  command: 'edit [index] [name...]',
  description: 'Change the name of a Task',
  action: action
};
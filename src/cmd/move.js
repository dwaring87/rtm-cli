'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command moves the Task to a different list
 * @param args index list
 * @param env
 */
function action(args, env) {

  // Prompt for List
  if ( args.length < 2 ) {
    prompt('Task:', 'List:', _promptFinished);
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
function _process(task, list, count=1, max=1) {
  log.spinner.start("Moving Task(s)...");
  config.user(function(user) {

    // Parse arguments
    task = parseInt(task.trim());
    list = list.trim();

    // Set Name
    user.tasks.move(task, list, function(err) {
      if ( err ) {
        log.spinner.error("Could not move Task #" + task + " (" + err.msg + ")");
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
  log.spinner.start("Moving Task [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("Task(s) Moved");
    return finish();
  }
}


module.exports = {
  command: 'move [index] [list...]',
  alias: 'mv',
  description: 'Move Task to a different List',
  action: action
};
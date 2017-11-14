'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');

let USER = undefined;
let TASKS = undefined;
let TASKS_PROCESSED = undefined;
let CALLBACK = undefined;


/**
 * This command marks 1 or more tasks as complete
 */
function action(args, env, callback) {
  config.user(function(user) {

    // Reset properties
    USER = user;
    TASKS = [];
    TASKS_PROCESSED = 0;
    CALLBACK = callback;

    // No index given, prompt for task indices
    if ( args.length === 0 ) {
      _prompt();
    }

    // Task index given
    else {
      TASKS = TASKS.concat(args);
      _processTasks();
    }

  });
}


/**
 * Prompt for task indices
 * @private
 */
function _prompt() {
  global._rl.question('Task: ', function (line) {
    if ( line === '' ) {
      _processTasks();
    }
    else {
      TASKS.push(line.trim());
      _prompt();
    }
  });
}


/**
 * Process the Tasks
 * @private
 */
function _processTasks() {
  if ( TASKS.length === 0 ) {
    return CALLBACK();
  }
  else {
    log.spinner.start("Completing Task(s)...");
    let timeout = 0;
    for ( let i = 0; i < TASKS.length; i++ ) {
      setTimeout(function() {
        _processTask(i)
      }, timeout);
      timeout = timeout + 1000;
    }
  }
}

/**
 * Process the Task specified by the index
 * @param index
 * @private
 */
function _processTask(index) {
  let task = parseInt(TASKS[index]);
  USER.tasks.complete(task, function(err) {
    _taskProcessed(err, index);
  });
}

/**
 * Callback function for when a task is processed
 * @param err RTMError encountered while processing
 * @param index The index of the task processed
 * @private
 */
function _taskProcessed(err, index) {
  TASKS_PROCESSED++;

  // Display Add Status
  if ( err ) {
    log.spinner.error("Could not complete task " + TASKS[index] + " (" + err.msg + ")");
  }
  else {
    log.spinner.start("Tasks Completed [" + TASKS_PROCESSED + "/" + TASKS.length + "]...");
  }

  // Finish when all tasks have been added
  if ( TASKS_PROCESSED === TASKS.length ) {
    log.spinner.success("Task(s) Completed");
    return CALLBACK();
  }
}


module.exports = {
  command: 'complete [indices...]',
  alias: 'x',
  description: 'Complete one or more Tasks',
  action: action
};
'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');

let USER = undefined;
let TASKS = undefined;
let TASKS_PROCESSED = undefined;
let CALLBACK = undefined;


/**
 * This command changes the priority of  1 or more tasks
 */
function action(args, env, callback) {
  config.user(function(user) {

    // Reset properties
    USER = user;
    TASKS = [];
    TASKS_PROCESSED = 0;
    CALLBACK = callback;

    // No index given, prompt for task indices
    if ( args.length !== 2 || args[0] === undefined || args[1] === undefined ) {
      _prompt();
    }

    // Task index given
    else {
      TASKS.push({
        task: args[0],
        priority: args[1]
      });
      _processTasks();
    }

  });
}


/**
 * Prompt for task indices
 * @private
 */
function _prompt() {

  // Prompt for Task Index
  global._rl.question('Task: ', function(task) {
    if ( task === '' ) {
      _processTasks();
    }
    else {

      // Prompt for Task Priority
      global._rl.question('Priority: ', function(priority) {
        if ( priority === '' ) {
          _processTasks();
        }
        else {
          TASKS.push({
            task: parseInt(task.trim()),
            priority: parseInt(priority.trim())
          });
          _prompt();
        }

      });
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
    log.spinner.start("Setting Task Priorities...");
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
  let task = parseInt(TASKS[index].task);
  let priority = parseInt(TASKS[index].priority);
  USER.tasks.priority(task, priority, function(err) {
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
    log.spinner.error("Could not change priority of task " + TASKS[index].task + " (" + err.msg + ")");
  }
  else {
    log.spinner.start("Tasks Updated [" + TASKS_PROCESSED + "/" + TASKS.length + "]...");
  }

  // Finish when all tasks have been added
  if ( TASKS_PROCESSED === TASKS.length ) {
    log.spinner.success("Task(s) Updated");
    return CALLBACK();
  }
}


module.exports = {
  command: 'pri [index] [priority]',
  alias: 'p',
  description: 'Change Task Priority',
  action: action
};
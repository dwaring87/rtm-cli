'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');

let USER = undefined;
let TASKS = undefined;
let TASKS_ADDED = undefined;
let CALLBACK = undefined;


/**
 * This command adds 1 or more tasks to the User's account
 */
function action(args, env, callback) {
  config.user(function(user) {

    // Reset properties
    USER = user;
    TASKS = [];
    TASKS_ADDED = 0;
    CALLBACK = callback;

    // No task given, prompt for new tasks
    if ( args.length === 0 ) {
      _prompt();
    }

    // New task given, add it
    else {
      let task = args.join(' ');
      TASKS.push(_parseTask(task));
      _addTasks();
    }

  });
}


/**
 * Prompt for new tasks to add.
 * Press [enter] to stop adding.
 * @private
 */
function _prompt() {
  global._rl.question('New Task: ', function (line) {
    if ( line === '' ) {
      _addTasks();
    }
    else {
      TASKS.push(_parseTask(line));
      _prompt();
    }
  });
}


/**
 * Parse the Task to Add
 *
 * Replace p: with !
 * Replace l: with #
 * Replace t: with #
 * Replace due: with ^
 * @param task
 * @returns {string}
 * @private
 */
function _parseTask(task) {
  task = task.replace(/p:/g, "!");
  task = task.replace(/l:/g, "#");
  task = task.replace(/t:/g, "#");
  task = task.replace(/due:/g, "^");
  return task;
}



/**
 * Add the processed tasks to the User's Account
 * @private
 */
function _addTasks() {
  if ( TASKS.length === 0 ) {
    return CALLBACK();
  }
  else {
    log.spinner.start("Adding New Task(s)...");
    let timeout = 0;
    for ( let i = 0; i < TASKS.length; i++ ) {
      setTimeout(function() {
          _addTask(i)
        }, timeout);
      timeout = timeout + 1000;
    }
  }
}

/**
 * Add the Task specified by the index to the User's account
 * @param index
 * @private
 */
function _addTask(index) {
  USER.tasks.add(TASKS[index], function(err) {
    _taskAdded(err, index);
  });
}

/**
 * Callback function for when a task is added
 * @param err RTMError encountered while adding
 * @param index The index of the task added
 * @private
 */
function _taskAdded(err, index) {
  TASKS_ADDED++;

  // Display Add Status
  if ( err ) {
    log.spinner.error("Could not add task " + TASKS[index] + " (" + err.msg + ")");
  }
  else {
    log.spinner.start("Task Added [" + TASKS_ADDED + "/" + TASKS.length + "]...");
  }

  // Finish when all tasks have been added
  if ( TASKS_ADDED === TASKS.length ) {
    log.spinner.success("Task(s) Added");
    return CALLBACK();
  }
}


module.exports = {
  command: 'add [task...]',
  alias: 'a',
  description: 'Add a new Task [task name due date p:priority l:list t:tag]',
  action: action
};
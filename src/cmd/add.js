'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command adds 1 or more tasks to the User's account
 * @param args task
 * @param env
 */
function action(args, env) {

  // Prompt for new tasks
  if ( args.length === 0 ) {
    prompt('New Task:', _promptFinished);
  }

  // Add provided task
  else {
    _process(args[0].join(' '));
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
  log.spinner.start("Adding New Task(s)...");
  config.user(function(user) {
    task = _parseTask(task);

    // Add Task
    user.tasks.add(task, function(err) {
      if ( err ) {
        log.spinner.error("Could not add new Task #" + count + " (" + err.msg + ")");
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
  log.spinner.start("Adding Task [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("Task(s) Added");
    return finish();
  }
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
  task = task.replace(/(\s+)p:([0-4]{1})($|[\s\r\n]+)/, " !$2$3").trim();
  task = task.replace(/(\s+)l:([\w\d]+)/, " #$2").trim();
  task = task.replace(/(\s+)t:([\w\d]+)/g, " #$2").trim();
  task = task.replace(/(\s+)due:([\w\d]+)/, " ^$2").trim();
  return task;
}



module.exports = {
  command: 'add [task...]',
  alias: 'a',
  description: 'Add a new Task',
  action: action
};
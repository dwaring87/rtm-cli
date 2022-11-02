'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command adds 1 or more tags to a Task
 * @param args index tags...
 * @param env
 */
function action(args, env) {

  // Prompt for new tags
  if ( args.length < 2 ) {
    prompt('Task:', 'Tags:', _promptFinished);
  }

  // Add provided tags
  else {
    _process(args[0], args[1]);
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
function _process(task, tags, count=1, max=1) {
  log.spinner.start("Adding Tags(s)...");
  config.user(function(user) {

    // Parse arguments
    task = parseInt(task.trim());
    if ( !Array.isArray(tags) ) {
      tags = tags.trim().split(' ');
    }

    // Add Tags
    user.tasks.addTags(task, tags, function(err) {
      if ( err ) {
        log.spinner.error("Could not add tags to Task #" + task + " (" + err.msg + ")");
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
  log.spinner.start("Adding Tags [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("Tag(s) Added");
    return finish();
  }
}


module.exports = {
  command: 'addTags [index] [tags...]',
  alias: 'at',
  description: 'Add one or more tags to a Task',
  action: action
};
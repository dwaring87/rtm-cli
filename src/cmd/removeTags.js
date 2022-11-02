'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command removes 1 or more tags from a Task
 * @param args index tags...
 * @param env
 */
function action(args, env) {

  // Prompt for tags
  if ( args.length < 2 ) {
    prompt('Task:', 'Tags:', _promptFinished);
  }

  // Remove provided tags
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
  log.spinner.start("Removing Tags(s)...");
  config.user(function(user) {

    // Parse arguments
    task = parseInt(task.trim());
    if ( !Array.isArray(tags) ) {
      tags = tags.trim().split(' ');
    }

    // Add Tags
    user.tasks.removeTags(task, tags, function(err) {
      if ( err ) {
        log.spinner.error("Could not remove tags from Task #" + task + " (" + err.msg + ")");
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
  log.spinner.start("Removing Tags [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("Tag(s) Removed");
    return finish();
  }
}


module.exports = {
  command: 'removeTags [index] [tags...]',
  alias: 'rmt',
  description: 'Remove one or more tags from a Task',
  action: action
};
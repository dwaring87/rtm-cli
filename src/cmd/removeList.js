'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command removes 1 or more Lists from the User's account
 * @param args name
 * @param env
 */
function action(args, env) {

  // Prompt for Arguments
  if ( args.length === 0 ) {
    prompt('Remove List:', _promptFinished);
  }

  // Process the given arguments
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
function _process(list, count=1, max=1) {
  log.spinner.start("Removing List(s)...");
  config.user(function(user) {
    list = list.trim();

    // Remove List
    user.lists.remove(list, function(err) {
      if ( err ) {
        log.spinner.error("Could not Remove List " + list + " (" + err.msg + ")");
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
  log.spinner.start("Removing List [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("List(s) Removed");
    return finish();
  }
}


module.exports = {
  command: 'removeList [name...]',
  alias: 'rml',
  description: 'Remove a List',
  action: action
};
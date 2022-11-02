'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command archives 1 or more Lists from the User's account
 * @param args name
 * @param env
 */
function action(args, env) {

  // Prompt for Arguments
  if ( args.length === 0 ) {
    prompt('Archive List:', _promptFinished);
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
  log.spinner.start("Archiving List(s)...");
  config.user(function(user) {
    list = list.trim();
    // Archive List
    user.lists.archive(list, function(err) {
      if ( err ) {
        log.spinner.error("Could not Archive List " + list + " (" + err.msg + ")");
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
  log.spinner.start("Archiving List [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("List(s) Archived");
    return finish();
  }
}


module.exports = {
  command: 'archiveList [name...]',
  alias: 'arl',
  description: 'Archive a List',
  action: action
};
'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command adds 1 or more Lists to the User's account
 * @param args name
 * @param env
 */
function action(args, env) {
  let _args = [];
  for ( let i = 0; i < args.length; i++ ) {
    _args = _args.concat(args[i]);
  }

  // Prompt for new lists
  if ( args.length === 0 ) {
    prompt('New List:', _promptFinished);
  }

  // Add provided task
  else {
    _process(_args.join(' '));
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
  log.spinner.start("Adding New List(s)...");
  config.user(function(user) {
    list = list.trim();
    let filter = undefined;

    // Parse as Smart List
    if ( list.indexOf(':') > -1 ) {
      let colon = list.indexOf(':');
      let divider = list.substring(0, colon).lastIndexOf(' ');
      filter = list.substring(divider+1);
      list = list.substring(0, divider);
    }

    // Add List
    user.lists.add(list, filter, function(err) {
      if ( err ) {
        log.spinner.error("Could not add new List " + list + " (" + err.msg + ")");
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
  log.spinner.start("Adding List [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("List(s) Added");
    return finish();
  }
}


module.exports = {
  command: 'addList [name] [filter...]',
  alias: 'al',
  description: 'Add a new List or Smart List',
  action: action
};
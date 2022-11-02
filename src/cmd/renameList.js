'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');

const finish = require('../utils/finish.js');


/**
 * This command renames 1 or more Lists
 * @param args old new
 * @param env
 */
function action(args, env) {

  // Prompt for Arguments
  if ( args.length < 2 ) {
    prompt('Old Name:', 'New Name:',  _promptFinished);
  }

  // Process the given arguments
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
function _process(oldName, newName, count=1, max=1) {
  log.spinner.start("Renaming List(s)...");
  config.user(function(user) {
    oldName = oldName.trim();
    newName = newName.trim();

    // Rename List
    user.lists.rename(oldName, newName, function(err) {
      if ( err ) {
        log.spinner.error("Could not Rename List " + oldName + " (" + err.msg + ")");
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
  log.spinner.start("Renaming List [" + count + "/" + max + "]...");
  if ( count === max ) {
    log.spinner.success("List(s) Renamed");
    return finish();
  }
}


module.exports = {
  command: 'renameList [oldName] [newName]',
  alias: 'mvl',
  description: 'Rename a List',
  action: action
};
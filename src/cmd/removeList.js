'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');

let USER = undefined;
let LISTS = undefined;
let LISTS_REMOVED = undefined;
let CALLBACK = undefined;


/**
 * This command removes 1 or more lists from the User's account
 */
function action(args, env, callback) {
  config.user(function(user) {

    // Reset properties
    USER = user;
    LISTS = [];
    LISTS_REMOVED = 0;
    CALLBACK = callback;

    // No list given, prompt for new lists
    if ( args.length === 0 ) {
      _prompt();
    }

    // New list given, add it
    else {
      LISTS.push(args.join(' '));
      _removeLists();
    }

  });
}


/**
 * Prompt for lists names to remove.
 * @private
 */
function _prompt() {
  global._rl.question('Remove List: ', function (line) {
    if ( line === '' ) {
      _removeLists();
    }
    else {
      LISTS.push(line.trim());
      _prompt();
    }
  });
}


/**
 * Remove the processed lists to the User's Account
 * @private
 */
function _removeLists() {
  if ( LISTS.length === 0 ) {
    return CALLBACK();
  }
  else {
    log.spinner.start("Removing List(s)...");
    let timeout = 0;
    for ( let i = 0; i < LISTS.length; i++ ) {
      setTimeout(function() {
        _removeList(i)
      }, timeout);
      timeout = timeout + 1000;
    }
  }
}

/**
 * Remove the List specified by the index from the User's account
 * @param index
 * @private
 */
function _removeList(index) {
  let list = LISTS[index];

  USER.lists.remove(list, function(err) {
    _listRemoved(err, index);
  });
}

/**
 * Callback function for when a list is removed
 * @param err RTMError encountered while removing
 * @param index The index of the list removed
 * @private
 */
function _listRemoved(err, index) {
  LISTS_REMOVED++;

  // Display Add Status
  if ( err ) {
    log.spinner.error("Could not remove list " + LISTS[index] + " (" + err.msg + ")");
  }
  else {
    log.spinner.start("Lists Removed [" + LISTS_REMOVED + "/" + LISTS.length + "]...");
  }

  // Finish when all tasks have been added
  if ( LISTS_REMOVED === LISTS.length ) {
    log.spinner.success("List(s) Removed");
    return CALLBACK();
  }
}


module.exports = {
  command: 'removeList [name...]',
  alias: 'rml',
  description: 'Remove a List',
  action: action
};
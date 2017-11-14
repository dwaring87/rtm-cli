'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');

let USER = undefined;
let LISTS = undefined;
let LISTS_ADDED = undefined;
let CALLBACK = undefined;


/**
 * This command adds 1 or more lists to the User's account
 */
function action(args, env, callback) {
  config.user(function(user) {

    // Reset properties
    USER = user;
    LISTS = [];
    LISTS_ADDED = 0;
    CALLBACK = callback;

    // No list given, prompt for new lists
    if ( args.length === 0 ) {
      _prompt();
    }

    // New list given, add it
    else {
      LISTS.push(args.join(' '));
      _addLists();
    }

  });
}


/**
 * Prompt for new lists to add.
 * Press [enter] to stop adding.
 * @private
 */
function _prompt() {
  global._rl.question('New List: ', function (line) {
    if ( line === '' ) {
      _addLists();
    }
    else {
      LISTS.push(line.trim());
      _prompt();
    }
  });
}


/**
 * Add the processed lists to the User's Account
 * @private
 */
function _addLists() {
  if ( LISTS.length === 0 ) {
    return CALLBACK();
  }
  else {
    log.spinner.start("Adding New List(s)...");
    let timeout = 0;
    for ( let i = 0; i < LISTS.length; i++ ) {
      setTimeout(function() {
          _addList(i)
        }, timeout);
      timeout = timeout + 1000;
    }
  }
}

/**
 * Add the List specified by the index to the User's account
 * @param index
 * @private
 */
function _addList(index) {
  let list = LISTS[index];
  let filter = undefined;

  // Parse as Smart List
  if ( list.indexOf(':') > -1 ) {
    let colon = list.indexOf(':');
    let divider = list.substring(0, colon).lastIndexOf(' ');
    filter = list.substring(divider+1);
    list = list.substring(0, divider);
  }

  USER.lists.add(list, filter, function(err) {
    _listAdded(err, index);
  });
}

/**
 * Callback function for when a list is added
 * @param err RTMError encountered while adding
 * @param index The index of the list added
 * @private
 */
function _listAdded(err, index) {
  LISTS_ADDED++;

  // Display Add Status
  if ( err ) {
    log.spinner.error("Could not add list " + LISTS[index] + " (" + err.msg + ")");
  }
  else {
    log.spinner.start("Lists Added [" + LISTS_ADDED + "/" + LISTS.length + "]...");
  }

  // Finish when all tasks have been added
  if ( LISTS_ADDED === LISTS.length ) {
    log.spinner.success("List(s) Added");
    return CALLBACK();
  }
}


module.exports = {
  command: 'addList [name...]',
  alias: 'al',
  description: 'Add a new List or Smart List',
  action: action
};
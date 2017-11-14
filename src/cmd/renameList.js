'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');

let USER = undefined;
let LISTS = undefined;
let LISTS_RENAMED = undefined;
let CALLBACK = undefined;


/**
 * This command renames 1 or more lists from the User's account
 */
function action(args, env, callback) {
  config.user(function(user) {

    // Reset properties
    USER = user;
    LISTS = [];
    LISTS_RENAMED = 0;
    CALLBACK = callback;

    // No list given, prompt for new lists
    if ( args.length < 2 || args[0] === undefined || args[1] === undefined ) {
      _prompt();
    }

    // New list given, add it
    else {
      LISTS.push({
        oldName: args[0],
        newName: args[1]
      });
      _renameLists();
    }

  });
}


/**
 * Prompt for lists names.
 * @private
 */
function _prompt() {

  // Prompt for Old Name
  global._rl.question('Old Name: ', function(oldName) {
    if ( oldName === '' ) {
      _renameLists();
    }
    else {

      // Prompt for New Name
      global._rl.question('New Name: ', function(newName) {
        if ( newName === '' ) {
          _renameLists();
        }
        else {
          LISTS.push({
            oldName: oldName.trim(),
            newName: newName.trim()
          });
          _prompt();
        }

      });
    }
  });
}


/**
 * Rename the processed lists
 * @private
 */
function _renameLists() {
  if ( LISTS.length === 0 ) {
    return CALLBACK();
  }
  else {
    log.spinner.start("Renaming List(s)...");
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
  USER.lists.rename(list.oldName, list.newName, function(err) {
    _listRenamed(err, index);
  });
}

/**
 * Callback function for when a list is renamed
 * @param err RTMError encountered while renaming
 * @param index The index of the list renamed
 * @private
 */
function _listRenamed(err, index) {
  LISTS_RENAMED++;

  // Display Add Status
  if ( err ) {
    log.spinner.error("Could not rename list " + LISTS[index].oldName + " (" + err.msg + ")");
  }
  else {
    log.spinner.start("Lists Renamed [" + LISTS_RENAMED + "/" + LISTS.length + "]...");
  }

  // Finish when all tasks have been added
  if ( LISTS_RENAMED === LISTS.length ) {
    log.spinner.success("List(s) Renamed");
    return CALLBACK();
  }
}


module.exports = {
  command: 'renameList [oldName] [newName]',
  alias: 'mvl',
  description: 'Rename a List',
  action: action
};
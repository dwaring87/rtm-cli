'use strict';

const interactive = require('../interactive.js');


/**
 * This function is called when a command is finished.  It will
 * return to an interactive prompt, if in interactive mode, or
 * exit the process.
 */
function finish() {
  if ( global._interactive ) {
    interactive();
  }
  else {
    process.exit(0);
  }
}


module.exports = finish;
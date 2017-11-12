'use strict';

const chalk = require('chalk');
const spinner = require('ora')();

/**
 * Log the specified text
 * @param {string} text The text to log
 * @param {boolean} [newline=true] End the log with a newline
 */
function log(text="", newline=true) {
  let nl = newline ? '\n' : '';
  process.stdout.write(text + nl);
}

/**
 * Log the specified text as an Info block
 * @param {string} text The text to log
 * @param {boolean} [newline=true] End the log with a newline
 */
log.info = function(text, newline=true) {
  let nl = newline ? '\n' : '';
  process.stdout.write(chalk.bgYellow.black(" " + text + " " + nl));
};


/**
 * Log the specified text with the specified `chalk` style
 * @param {string} text The text to log
 * @param {string} [style=reset] The chalk style attributes (ex: bgYellow.black)
 * @param {boolean} [newline=false] End the log with a newline
 */
log.style = function(text, style, newline) {
  if ( style === undefined && newline === undefined ) {
    style = 'reset';
    newline = false;
  }
  else if ( newline === undefined && typeof style === 'boolean' ) {
    newline = style;
    style = 'reset';
  }

  if ( style.indexOf('bg') > -1 ) {
    text = ' ' + text + ' ';
  }

  let nl = newline ? '\n' : '';
  let ch = chalk;
  let parts = style.split('.');
  for ( let i = 0; i < parts.length; i++ ) {
    let part = parts[i];
    ch = ch[part];
  }
  process.stdout.write(ch(text + nl));
};


/**
 * Log an Error: use the spinner fail function
 * @param {string} text The text to log
 */
log.error = function(text) {
  log.spinner.error(text);
};


/**
 * Spinner-related functions
 * @type {{start: log.spinner.start, stop: log.spinner.stop, success: log.spinner.success, error: log.spinner.error}}
 */
log.spinner = {

  /**
   * Start the spinner with the specified text
   * @param {string} text The text to log
   */
  start: function(text) {
    spinner.start(text);
  },

  /**
   * Stop and clear the spinner
   */
  stop: function() {
    spinner.stop();
  },

  /**
   * Set the spinner as a success with the specified text
   * @param {string} text The text to log
   */
  success: function(text) {
    spinner.succeed(text);
  },

  /***
   * Set the spinner as an error with the specified text
   * @param {string} text The text to log
   */
  error: function(text) {
    spinner.fail(text);
  }

};



module.exports  = log;
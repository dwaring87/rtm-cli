#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const program = require('commander');
const info = require('../package.json');

/**
 * Directory containing command files
 * @private
 */
const CMD_DIR = path.normalize(__dirname + '/cmd/');



// Start the CLI Setup
setup();




/**
 * Set up the program arguments, commands and options
 * @private
 */
function setup() {

  // Add Program Information
  program
    .version(info.version)
    .usage("[options] <command> [command arguments]");

  // Add Program Commands
  parseCommands();

  // Parse the Command Line Args
  program.parse(process.argv);

}


/**
 * Parse the commands in the command directory
 * @private
 */
function parseCommands() {
  let files = fs.readdirSync(CMD_DIR);
  for ( let i = 0; i < files.length; i++ ) {
    parseCmd(path.normalize(CMD_DIR + '/' + files[i]));
  }
}


/**
 * Parse the command file
 * @param {string} file Path to command file
 * @private
 */
function parseCmd(file) {
  let opts = require(file);

  // Build Command
  let cmd = program.command(opts.command);
  cmd.description(opts.description);
  cmd.action(opts.action);
}


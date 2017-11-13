#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const program = require('commander');
const info = require('../package.json');
const interactive = require('./interactive.js');

/**
 * Directory containing command files
 * @private
 */
const CMD_DIR = path.normalize(__dirname + '/cmd/');




// Start the CLI Setup
setup();


// Start interactive mode
if ( process.argv.length < 3 ) {
  interactive();
}

// Parse the Command Line Args
else {
  program.parse(process.argv);
}




/**
 * Set up the program arguments, commands and options
 * @private
 */
function setup() {

  // Add Program Information
  program
    .version(info.version)
    .usage("[options] <command> [command arguments]");

  // Add Options
  program
    .option('-p, --plain', 'Do not print styled/colored text');

  // Add additional Help information
  program.on('--help', function() {
    console.log('');
    console.log('');
    console.log('  Documentation:');
    console.log('');
    console.log('    Additional docs can be found in the GitHub repo:');
    console.log('      https://github.com/dwaring87/rtm-cli');
    console.log('    This project uses the RTM API Wrapper for NodeJS:');
    console.log('      https://github.com/dwaring87/rtm-api');
    if ( config.get()._user ) {
      console.log('');
      console.log('');
      console.log('  Logged In As: ' + config.get()._user.username);
    }
  });

  // Add Program Commands
  parseCommands();

  // Set program to global namespace
  global._program = program;

  // Set readline interface
  global._rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: function completer(line) {
      let completions = [];
      for ( let i = 0; i < program.commands.length; i++ ) {
        completions.push(program.commands[i].name());
      }
      completions.push('quit');
      completions.push('help');
      let hits = completions.filter(function(c) { return c.indexOf(line) === 0 });
      return [hits.length ? hits : completions, line]
    }
  });

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
  cmd.action(function(args, env) {
    opts.action(args, env, function() {
      if ( global._interactive ) {
        interactive();
      }
      else {
        process.exit(0);
      }
    });
  });
}


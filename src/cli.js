#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const program = require('commander');
const info = require('../package.json');
const log = require('./utils/log.js');
const config = require('./utils/config.js');
const finish = require('./utils/finish.js');
const interactive = require('./interactive.js');

/**
 * Directory containing command files
 * @private
 */
const CMD_DIR = path.normalize(__dirname + '/cmd/');




// Setup the Program options and commands
setup();

// Parse the CLI arguments and start the program
start();





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
      if ( global._mainPrompt ) {
        completions.push('help');
        for ( let i = 0; i < program.commands.length; i++ ) {
          completions.push(program.commands[i].name());
        }
        completions.push('quit');
      }
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
  cmd.alias(opts.alias);

  // Add Command Options
  if ( opts.options ) {
    for ( let i = 0; i < opts.options.length; i++ ) {
      let option = opts.options[i];
      cmd.option(option.option, option.description);
    }
  }

  // Add Command Action
  cmd.action(function() {
    let _arguments = arguments;

    // Check Login Before Running Command
    config.user(function() {

      // Process command arguments
      let args = [];
      let env = undefined;
      for ( let i = 0; i < _arguments.length; i++ ) {
        let arg = _arguments[i];
        if ( typeof arg === 'object' && !Array.isArray(arg) ) {
          env = arg;
        }
        else if ( Array.isArray(arg) && arg.length > 0 ) {
          args.push(arg);
        }
        else if ( !Array.isArray(arg) && arg !== undefined ) {
          args.push(arg);
        }
      }

      // Set command action with callback
      opts.action(args, env);

    });

  });
}


/**
 * Parse the CLI arguments and run the specified command
 * or start the interactive mode
 */
function start() {

  // Get possible commands
  let commands = [];
  let aliases = [];
  for ( let i = 0; i < program.commands.length; i++ ) {
    commands.push(program.commands[i].name());
    if ( program.commands[i].alias() !== undefined ) {
      aliases.push(program.commands[i].alias());
    }
  }

  // Get entered command
  let command = undefined;
  for ( let i = 2; i < process.argv.length; i++ ) {
    if ( command === undefined && process.argv[i].charAt(0) !== '-' ) {
      command = process.argv[i];
    }
  }

  // No command given
  if ( command === undefined ) {
    program.parse(process.argv);
    startInteractive();
  }

  // Recognized Command
  else if ( commands.indexOf(command) > -1 || aliases.indexOf(command) > -1 ) {
    program.parse(process.argv);
  }

  // Unknown command
  else {
    log.spinner.error("Unknown command: " + command);
    program.help();
  }

}


/**
 * Start the interactive mode
 */
function startInteractive() {
  if ( config.get()._user ) {
    log.style("Logged In As: " + config.get()._user.username, "dim", true);
  }
  interactive();
}
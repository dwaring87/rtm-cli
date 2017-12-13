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

  // Set Process Name
  process.title = 'rtm';

  // Add Program Information
  program
    .version(info.version)
    .usage("[options] <command> [command arguments]");

  // Add Options
  program
    .option('-p, --plain', 'do not use styled/colored text (overrides --color)')
    .option('-c, --color', 'force the use of styled/colored text')
    .option('-s, --status', 'toggle the display of the status spinner')
    .option('-x, --completed [value]', 'set display of completed tasks (true/false/number of days)')
    .option('-d, --hideDue [value]', 'hide tasks due more than n days from today (false/number of days)')
    .option('-f, --config [file]', 'specify configuration file', function(file) {
      config.reset(file);
      parseFilters();
    });

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

  // Parse Aliases
  parseAliases();

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
  }).on('SIGINT', function() {
    process.exit(0);
  });

  // Catch Thrown Errors
  process.on('uncaughtException', function(err) {
    log.error("ERROR: " + err);
    finish();
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

    // Process command arguments
    let args = [];
    let env = undefined;
    for ( let i = 0; i < arguments.length; i++ ) {
      let arg = arguments[i];
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

    // Skip Login Check
    if ( opts.disableLogin ) {
      opts.action(args, env);
    }

    // Check Login Before Running Command
    else {
      config.user(function() {
        opts.action(args, env);
      });
    }

  });
}


/**
 * Parse the Alias Commands from the Config Files
 */
function parseAliases() {
  if ( config.get().aliases ) {
    for ( let i = 0; i < config.get().aliases.length; i++ ) {
      let alias = config.get().aliases[i];

      // Check for existing command name
      let found = false;
      let existing = program.commands;
      for ( let j = 0; j < existing.length; j++ ) {
        if ( existing[j].name() === alias.name ) {
          found = true;
        }
      }

      // Add command to program, if not already added
      if ( !found ) {

        // Create Command with description
        let cmd = program.command(alias.name);
        cmd.description(alias.description);

        // Set Command Action
        cmd.action(function () {

          // Set Initial Args
          let args = [
            process.argv[0],
            process.argv[1],
            alias.command
          ];

          // Add Arguments
          if ( alias.args ) {
            alias.args = alias.args.split(' ');
            for ( let j = 0; j < alias.args.length; j++ ) {
              args.push(alias.args[j]);
            }
          }

          // Add CLI arguments
          if ( process.argv.length > 3 ) {
            for ( let j = 3; j < process.argv.length; j++ ) {
              args.push(process.argv[j]);
            }
          }

          // Parse the command
          global._program.parse(args);

        });
        
      }
    }
  }
}


/**
 * Parse the CLI arguments and run the specified command
 * or start the interactive mode
 */
function start() {

  // Parse the process arguments
  program.parse(process.argv);

  // Get parsed command
  let command = global._program.args[global._program.args.length-1];

  // Start interactive mode if no command
  if ( command === undefined ) {
    startInteractive();
  }

  // Unknown Command
  else if ( typeof command === 'string' ) {
    log.spinner.error('ERROR: Unknown Command');
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
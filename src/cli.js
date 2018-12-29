#!/usr/bin/env node
'use strict';

const os = require('os');
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
      parsePlugins();
      parseAliases();
    })
    .option('-v, --verbose', 'print stack traces on errors');

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

  // Error on Unknown Command
  program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

  // Add Program Commands
  parseCommands();

  // Add Any Plugins
  parsePlugins();

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
    if ( program.verbose ) {
      console.log(err);
    }
    finish();
  });

}



// ===== COMMAND PARSING ===== //


/**
 * Parse the commands in the command directory
 * @private
 */
function parseCommands() {
  let files = fs.readdirSync(CMD_DIR);
  for ( let i = 0; i < files.length; i++ ) {
    let file = path.normalize(CMD_DIR + '/' + files[i]);
    let command = require(file);
    parseCmd(command);
  }
}


/**
 * Parse the command file
 * @param {object} command The command object to parse
 * @private
 */
function parseCmd(command) {

  // Check for existing command name
  let existing = program.commands;
  for ( let i = 0; i < existing.length; i++ ) {
    if ( existing[i].name() === command.command.split(' ')[0] ) {
      log.error("ERROR: Command name (" + command.command.split(' ')[0] + ") already exists");
      process.exit(1);
    }
  }

  // Build Command
  let cmd = program.command(command.command);
  cmd.description(command.description);
  cmd.alias(command.alias);

  // Add Command Options
  if ( command.options ) {
    for ( let i = 0; i < command.options.length; i++ ) {
      let option = command.options[i];
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
    if ( command.disableLogin ) {
      command.action(args, env);
    }

    // Check Login Before Running Command
    else {
      config.user(function() {
        command.action(args, env);
      });
    }

  });
}



// ===== PLUGIN PARSING ===== //


/**
 * Parse the plugins listed in the configuration
 */
function parsePlugins() {

  // Get plugin locations from the configuration
  let locations = config.get().plugins;

  // Parse each location
  for ( let i = 0; i < locations.length; i++ ) {
    parsePluginLocation(locations[i]);
  }

}


/**
 * Parse the specified plugin location
 * @param {string} location Plugin location (file, directory or module name)
 * @private
 */
function parsePluginLocation(location) {

  // Replace {{HOME}} with home directory location
  location = location.replace("{{HOME}}", os.homedir());

  // Try to load as a module (either directory or file)
  try {
    require.resolve(location);
    parsePluginModule(location);
  }

  // Not a module...
  catch (err) {

    // Check to make sure file/directory exists
    if ( fs.existsSync(location) ) {

      // Check if a directory
      if ( fs.lstatSync(location).isDirectory() ) {
        parsePluginDirectory(location);
      }

    }

  }

}

/**
 * Parse the Plugin as a Module
 * @param {string} location Module location (for `require`)
 * @private
 */
function parsePluginModule(location) {

  // Load the module
  let module = require(location);

  // Check the root module for a command
  _check(module);

  // Check children objects for a command
  for ( let key in module ) {
    if ( module.hasOwnProperty(key) ) {
      _check(module[key]);
    }
  }

  /**
   * Check the object for the required command properties and parse the
   * object as a command if they are all found
   * @param obj
   * @private
   */
  function _check(obj) {
    if ( obj.hasOwnProperty('command') && obj.hasOwnProperty('description') && obj.hasOwnProperty('action') ) {
      parseCmd(obj);
    }
  }

}

/**
 * Process a plugin directory
 * @param location
 */
function parsePluginDirectory(location) {

  // Check if location exists
  if ( fs.existsSync(location) ) {

    // Get all files in directory
    let files = fs.readdirSync(location);

    // Parse each location
    for ( let i = 0; i < files.length; i++ ) {
      parsePluginLocation(path.normalize(location + '/' + files[i]));
    }

  }

}



// ===== ALIAS PARSING ===== //


/**
 * Parse the Alias Commands from the Config Files
 */
function parseAliases() {

  // Remove existing RTM Aliases
  let keep = [];
  let current = program.commands;
  for ( let i = 0; i < current.length; i++ ) {
    let cmd = current[i];
    if ( !cmd._isRTMAlias ) {
      keep.push(cmd);
    }
  }
  program.commands = keep;

  // Parse aliases in configuration
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
            let aa = alias.args.split(' ');
            for ( let j = 0; j < aa.length; j++ ) {
              args.push(aa[j]);
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

        // Flag command as RTM Alias
        cmd._isRTMAlias = true;

      }
    }
  }

}




// ===== START FUNCTIONS ===== //


/**
 * Parse the CLI arguments and run the specified command
 * or start the interactive mode
 */
function start() {

  // Start interactive mode
  if ( process.argv.length <= 2 ) {
    startInteractive();
  }

  // Parse the process arguments
  else {
    program.parse(process.argv);
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
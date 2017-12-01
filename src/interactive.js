'use strict';


/**
 * Display the Interactive Mode Prompt
 */
function prompt() {
  global._interactive = true;

  // Display the Prompt
  global._mainPrompt = true;
  global._rl.question("> ", function(line) {
    global._mainPrompt = false;

    // Parse the command from the entered line
    let params = line.trim().split(' ');
    let cmd = params[0];
    params.unshift(process.argv[0], process.argv[1]);

    // Get possible commands
    let commands = [];
    let aliases = [];
    for ( let i = 0; i < global._program.commands.length; i++ ) {
      commands.push(global._program.commands[i].name());
      if ( global._program.commands[i].alias() !== undefined ) {
        aliases.push(global._program.commands[i].alias());
      }
    }

    // Exit
    if ( cmd === 'quit' || cmd === 'exit' ) {
      global._rl.close();
      process.exit(0);
    }

    // Help
    else if ( cmd === 'help' ) {
      global._program.outputHelp();
      prompt();
    }

    // Parse the line command with commander
    else if ( commands.indexOf(cmd) > -1 || aliases.indexOf(cmd) > -1 ) {
      global._program.parse(params);
    }

    // Nothing entered
    else if ( cmd === '' ) {
      prompt();
    }

    // Unknown command
    else {
      const log = require('./utils/log.js');
      log.spinner.error("Unknown Command");
      log.style("Commands: help," + commands.join(',') + ",quit", "dim", true);
      prompt();
    }

  });

}


module.exports = prompt;
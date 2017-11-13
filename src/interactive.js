'use strict';

const log = require('./utils/log.js');


/**
 * Display the Interactive Mode Prompt
 */
function prompt() {
  global._interactive = true;

  // Display the Prompt
  global._rl.question("> ", function(line) {

    // Parse the command from the entered line
    let params = line.trim().split(' ');
    let cmd = params[0].toLowerCase();
    params.unshift(process.argv[0], process.argv[1])

    // Get possible commands
    let commands = [];
    for ( let i = 0; i < global._program.commands.length; i++ ) {
      commands.push(global._program.commands[i].name());
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
    else if ( commands.indexOf(cmd) > -1 ) {
      global._program.parse(params);
    }

    // Nothing entered
    else if ( cmd === '' ) {
      prompt();
    }

    // Unknown command
    else {
      log.spinner.error("Unknown Command");
      log.style("Commands: help," + commands.join(',') + ",quit", "dim", true);
      prompt();
    }

  });

}


module.exports = prompt;
'use strict';

const readline = require('readline');


let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});




function prompt() {
  global._interactive = true;

  rl.question("> ", function(line) {
    let params = line.trim().split(' ');
    let cmd = params[0];
    params.unshift(process.argv[0], process.argv[1]);

    // Exit
    if ( cmd.toLowerCase() === 'quit' || cmd.toLowerCase() === 'exit' ) {
      process.exit(0);
    }

    // Help
    if ( cmd.toLowerCase() === 'help' ) {
      global._program.outputHelp();
      prompt();
    }

    // Parse the line command with commander
    global._program.parse(params);

    prompt();
  });
}


module.exports = prompt;
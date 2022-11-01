var prompt = require('prompt-sync')();
const log = require('./log.js');

/**
 * Prompts user for integer input until they enter a blank line
 * @param {string} text 
 * @returns {number[]} array of user input integers
 */
function taskPrompt(text) {
    let tasks = []
    let n
    log.style("[Enter a blank line when finished]", "dim", true);
    while ( n != '' ) {
        n = prompt(text)
        if (parseInt(n) ) {
            tasks.push(n)
         } else if (n == '') {
            break
         } else {
            log.style('Enter a task index number, please.',"red",true)
         } 
    }

    return tasks

}

module.exports = { taskPrompt }

'use strict';

const finish = require('./finish.js');
const log = require('./log.js');
const promptSync = require('prompt-sync')();

/**
 * Prompt the User for a set of answers
 * @param {string} prompt One or more prompts to question the User
 * @param {function} callback Callback function(answers)
 * @deprecated Use indexPrompt
 instead
 */
function prompt(prompt, callback) {

  // Set callback
  callback = arguments[arguments.length-1];

  // Set prompts
  let prompts = [];
  for ( let i = 0; i < arguments.length-1; i++ ) {
    prompts.push(arguments[i]);
  }

  // Start first prompt
  log.style("[Enter a blank line when finished]", "dim", true);
  _prompt(0, prompts, 0, [], callback);

}


/**
 * Display the current prompt
 * @param promptIndex Current prompt
 * @param prompts Set of prompts
 * @param answerIndex Current Answer
 * @param answers Set of accumulated Answers
 * @param callback Final Callback
 * @private
 */
function _prompt(promptIndex, prompts, answerIndex, answers, callback) {
  global._rl.question(prompts[promptIndex] + " ", function(answer) {

    // Return with the answers
    if ( promptIndex === 0 && answer === '' ) {
      return _finish(answers, prompts.length, callback);
    }

    // Keep prompting
    else {

      // Set Answer
      if ( !answers[answerIndex] ) {
        answers[answerIndex] = [];
      }
      answers[answerIndex][promptIndex] = answer;

      // Next Prompt
      if ( promptIndex < prompts.length - 1 ) {
        promptIndex++;
        _prompt(promptIndex, prompts, answerIndex, answers, callback);
      }

      // Next Answer
      else {
        answerIndex++;
        _prompt(0, prompts, answerIndex, answers, callback);
      }

    }

  });

}


/**
 * Remove any incomplete answers.  Then return to the final callback
 * @param answers
 * @param promptcount
 * @param callback
 * @private
 */
function _finish(answers, promptcount, callback) {
  let rtn = [];
  for ( let i = 0; i < answers.length; i++ ) {
    let answer = answers[i];
    if ( answer.length === promptcount ) {
      rtn.push(answer);
    }
  }
  if ( rtn.length === 0 ) {
    return finish();
  }
  else {
    return callback(rtn);
  }
}


/**
 * Prompts user for integer input until they enter a blank line
 * @param {string} Prompt text to display
 * @returns {number[]} array of user input integers
 */
 function indexPrompt(text) {
  let tasks = []
  let n
  log.style('[Enter a blank line when finished]', 'dim', true);
  while ( n != '' ) {
      n = promptSync(text)
      if (parseInt(n) ) {
          tasks.push(n)
       } else if (n == '') {
          break
       } else {
          log.style('Enter a task index number, please.','red',true)
       } 
  }

  return tasks

}


module.exports = {prompt,indexPrompt};
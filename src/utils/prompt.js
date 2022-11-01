'use strict';

const finish = require('./finish.js');
const log = require('./log.js');


/**
 * Prompt the User for a set of answers
 * @param {string} prompt One or more prompts to question the User
 * @param {function} callback Callback function(answers)
 * @deprecated Use taskPrompt from newPrompt
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



module.exports = prompt;
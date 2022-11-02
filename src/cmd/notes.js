'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const { prompt } = require('../utils/prompt.js');
const finish = require('../utils/finish.js');
const filter = require('../utils/filter')
const { USER_CONFIG } = require('../utils/config.js');


let NOTES = [];


/**
 * This command displays a task's note
 * @param args index
 * @param env
 */
function action(args, env) {

  // Reset Notes
  NOTES = [];


  // Prompt for task
  if ( args.length < 1 ) {
    prompt('Task:', _promptFinished);
  }

  // Use provided args
  else {
    for ( let i = 0; i < args[0].length; i++ ) {
      _process(args[0][i], i+1, args[0].length);
    }
  }

}


/**
 * Process the returned answers
 * @private
 */
function _promptFinished(answers) {
  for ( let i = 0; i < answers.length; i++ ) {
    let answer = answers[i];
    _process(answer[0], i+1, answers.length);
  }
}


/**
 * Process the request
 * @private
 */
function _process(index, count=1, max=1) {

  // Display info
  log.spinner.start("Getting Task(s)...");

  // Get User
  config.user(function(user) {
    index = parseInt(index.trim());

    // Get Task
    let filterString = filter("hasNotes:true")
    user.tasks.getTask(index, filterString, function(err, task) {
      if ( err ) {
        if ( err.code === -3 ) {
          log.spinner.warn("Task #" + index + " does not have any notes or is not found.");
        }
        else {
          log.spinner.error("Could not get Task #" + index + " (" + err.msg + ")");
        }
      }

      if ( task ) {
        NOTES.push({
          index: index,
          name: task.name,
          notes: task.notes
        });
        // console.log(task)
      }

      // Finish
      _processFinished(count, max);

    });

  });
}

/**
 * Request Callback
 * @private
 */
function _processFinished(count, max) {
  log.spinner.start("Getting Task [" + count + "/" + max + "]...");

  // All tasks returned...
  if ( count === max ) {
    log.spinner.stop();

    // Get Display Styles
    let styles = config.get().styles;

    // Print NOTES
    for ( let i = 0; i < NOTES.length; i++ ) {
      log.style(_pad(NOTES[i].index , NOTES.length), styles.index);
      log.style(' ');
      log.style(NOTES[i].name, true);
      for (const note of NOTES[i].notes) {
        log.style('Note: ',styles.due)
        log.style(note.title ? note.title : '',true);
        log('========');
        log(note.body);
        log();
      }

    }

    return finish();
  }
}

/**
 * Pad the Index number with leading 0s
 * @param index Task Index Number
 * @param maxIndex Max Task Index
 * @returns {string}
 * @private
 */
function _pad(index, maxIndex) {
  let max = maxIndex.toString().length;
  let digits = index.toString().length;
  let delta = max - digits;
  for ( let i = 0; i < delta; i++ ) {
    index = '0' + index;
  }
  return index;
}


module.exports = {
  command: 'notes [indices...]',
  options: [],
  description: 'Display the associated Notes of a Task',
  action: action
};

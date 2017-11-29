'use strict';

const df = require('dateformat');
const login = require('../utils/login.js');
const sort = require('../utils/sort.js');
const log = require('../utils/log.js');
const finish = require('../utils/finish.js');
const parseFilter = require('../utils/filter.js');
const config = require('../utils/config.js');
const styles = config.get().styles;


/**
 * This command will display all of the User's tasks sorted first by priority,
 * then due date.
 */
function action(args, env) {
  let filter = parseFilter(args.length > 0 ? args[0].join(' ') : '');

  // Get the authenticated User
  config.user(function(user) {

    // Start Spinner
    log.spinner.start("Getting Tasks...");

    // Get User Tasks
    user.tasks.get(filter, function(err, tasks) {
      if ( err ) {
        log.spinner.error("Could not get tasks (" + err.msg + ")");
        return finish();
      }
      else if ( tasks.length === 0 ) {
        log.spinner.error("No tasks returned");
        return finish();
      }
      log.spinner.stop();

      // Get max task number
      tasks.sort(sort.tasks.index);
      let MAX_INDEX = tasks[tasks.length-1].index;

      // Sort Tasks
      tasks.sort(sort.tasks.lsp);

      // Parse each task
      for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];


        // ==== PRINT TASK INFORMATION ==== //

        // Print Task Index
        log.style(_pad(task.index, MAX_INDEX) + ' ', styles.index);

        // Print the Task Priority
        let priStyle = '';
        let priText = '';
        if ( !task.completed ) {
          priStyle = styles.priority[task.priority.toString()];
          if ( task.priority === 0 ) {
            priText += '    ';
          }
          else {
            priText += '(' + task.priority + ') ';
          }
        }
        else {
          priStyle = styles.completed;
          priText = ' x  ';
        }
        log.style(priText, priStyle);

        // Print the Task List Name
        let listStyle = task.isCompleted ? styles.completed : styles.list;
        log.style(task.list.name + ':', listStyle);

        // Print the Task Name
        log.style(' ' + task.name, priStyle);

        // Print Note Indicators
        let notestyle = task.isCompleted ? styles.completed : styles.notes;
        for ( let i = 0; i < task.notes.length; i++ ) {
          log.style('*', notestyle);
        }

        // Print Tags
        let tagstyle = task.isCompleted ? styles.completed : styles.tags;
        for ( let i = 0; i < task.tags.length; i++ ) {
          log.style(' #' + task.tags[i], tagstyle);
        }

        // Print Due Date / Completed Date
        if ( !task.isCompleted ) {
          if ( task.due ) {
            log.style(' | ' + df(task.due, config.get().dateformat), styles.due);
          }
        }
        else {
          if ( task.completed ) {
            log.style(' x ' + df(task.completed, config.get().dateformat), styles.completed);
          }
        }

        // Finish line
        log('');

      }

      // Finish
      return finish();

    });

  });

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
  command: 'lsp [filter...]',
  description: 'List all tasks sorted first by priority then due date',
  action: action
};
'use strict';

const df = require('dateformat');
const login = require('../utils/login.js');
const sort = require('../utils/sort.js');
const log = require('../utils/log.js');
const config = require('../utils/config.js');
const styles = config.get().styles;


/**
 * This command will display all of the User's tasks sorted first by list,
 * then completed status, then priority, then due date.
 */
function action(args, env, callback) {

  // Get the authenticated User
  config.user(function(user) {

    // Start Spinner
    log.spinner.start("Fetching Tasks...");

    // Get User Tasks
    let filter = args.length > 0 ? args.join(' ') : '';
    user.tasks.get(filter, function(err, tasks) {
      if ( err ) {
        log.spinner.error(err.toString());
        return callback();
      }
      else if ( tasks.length === 0 ) {
        log.spinner.error("No tasks returned");
        return callback();
      }
      log.spinner.stop();

      // Get max task number
      tasks.sort(sort.tasks.index);
      let MAX_INDEX = tasks[tasks.length-1].index;

      // Sort Tasks
      tasks.sort(sort.tasks.lsd);

      // Last Due Date
      let lastdue = -1;

      // Parse each task
      for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];
        let taskDue = task.due === undefined ? 0 : task.due.getTime();


        // ==== PRINT DUE DATE ==== //

        // Print New Due Date
        if ( lastdue !== taskDue ) {
          if ( lastdue !== -1 ) {
            log();
          }
          lastdue = task.due === undefined ? 0 : task.due.getTime();
          for ( let i = 0; i < MAX_INDEX.toString().length+1; i++ ) {
            log(' ', false);
          }
          if ( task.due !== undefined ) {
            log.style(df(task.due, config.dateformat), styles.due, true);
          }
          else {
            log.style("No Due Date", styles.due, true);
          }
        }



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

        // PrintCompleted Date
        if ( task.completed ) {
         log.style(' x ' + df(task.completed, config.dateformat), styles.completed);
        }

        // Finish line
        log('');

      }

      // Finish
      return callback();

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
  command: 'lsd [filter...]',
  description: 'List all tasks sorted first by due date then by priority',
  action: action
};
'use strict';

const df = require('dateformat');
const login = require('../utils/login.js');
const sort = require('../utils/sort.js');
const log = require('../utils/log.js');
const finish = require('../utils/finish.js');
const parseFilter = require('../utils/filter.js');
const config = require('../utils/config.js');
const printIndicator = require('../utils/printIndicator.js')


/**
 * This command will display all of the User's tasks sorted first by list,
 * then completed status, then priority, then due date.
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

      // Get Display Styles
      let styles = config.get().styles;

      // Get max task number
      tasks.sort(sort.tasks.index);
      let MAX_INDEX = tasks[tasks.length-1].index;

      // Sort Tasks
      tasks.sort(sort.tasks.lsd);

      // Last Due Date
      let lastDue = undefined;

      // Parse each task
      for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];
        let taskDue = task.due === undefined ? 0 : task.due.getDate();
        let taskDueTime = task.due === undefined ? 0 : task.due.getTime();

        // ==== PRINT DUE DATE ==== //

        // Print New Due Date
        if ( lastDue !== taskDue ) {
          if ( lastDue !== undefined ) {
            log();
          }
          // lastDue = task.due === undefined ? 0 : task.due.getTime();
          lastDue = taskDue;

          for ( let i = 0; i < MAX_INDEX.toString().length+1; i++ ) {
            log(' ', false);
          }

          if ( task.due !== undefined ) {
            log.style(df(task.due, config.get().dateformat), styles.due, true);
          }
          else {
            log.style("No Due Date", styles.due, true);
          }
        }



        // ==== PRINT TASK INFORMATION ==== //

        // Print Task Index
        log.style(_pad(task.index, MAX_INDEX), styles.index);
        log.style(' ');

        // Print the Task Priority
        let priStyle = '';
        if ( !task.completed ) {
          priStyle = styles.priority[task.priority.toString()];
          if ( task.priority === 0 ) {
            log.style('    ');
          }
          else {
            log.style('(' + task.priority + ')', priStyle);
            log.style(' ');
          }
        }
        else {
          priStyle = styles.completed;
          log.style(' ');
          log.style('x', priStyle);
          log.style('  ');
        }

        // Print the Task List Name
        let listStyle = task.isCompleted ? styles.completed : styles.list;
        log.style(task.list.name + ':', listStyle);

        // Print the Task Name
        log.style(' ');
        log.style(task.name + ' ', priStyle);

        // Print URL Indicator
        if ( task.url !== undefined ) {
          printIndicator('url',task);
        }

        // Print Note Indicators
        for ( let i = 0; i < task.notes.length; i++ ) {
          printIndicator('notes',task);
        }

        // Print Tags
        let tagstyle = task.isCompleted ? styles.completed : styles.tags;
        for ( let i = 0; i < task.tags.length; i++ ) {
          log.style(' ');
          log.style('#' + task.tags[i], tagstyle);
        }

        // Print Completed Date or Due Time
        if ( task.completed ) {
          log.style(' ');
          log.style('x', styles.completed);
          log.style(' ');
          log.style(df(task.completed, config.get().dateformat), styles.completed);
        } else {
          // Prints due time for incomplete tasks that have a time set
          df(taskDueTime,'shortTime') != '12:00 AM' && taskDueTime!= 0 
            ? log.style(' '+df(taskDueTime,'shortTime'),styles.due) 
            : null;
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
  command: 'lsd [filter...]',
  description: 'List all tasks sorted first by due date then by priority',
  action: action
};

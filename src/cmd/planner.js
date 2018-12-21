'use strict';

const df = require('dateformat');
const Table = require('cli-table3');
const ws = require('window-size');
const chalk = require('chalk');
const parseFilter = require('../utils/filter.js');
const config = require('../utils/config.js');
const log = require('../utils/log.js');
const sort = require('../utils/sort.js');
const finish = require('../utils/finish.js');

// Possible Start Arguments
const START_ARGS = ['sun', 'mon', 'today'];
const DEFAULT_START = START_ARGS[0];
const DEFAULT_WIDTH = 80;


/**
 * This command displays the tasks in a Weekly planner table.  The week
 * can start on either Sunday, Monday or the current day.
 */
function action(args, env) {

  // Set filter and start arguments
  let filter = parseFilter(args.length > 0 ? args[0].join(' ') : '');
  let start = (env.start === undefined ? DEFAULT_START : env.start).toLowerCase();
  let fixedWidth = (env.width === undefined ? undefined : parseInt(env.width));

  // Check start arg
  if ( START_ARGS.indexOf(start) === -1 ) {
    log.error("ERROR: start arg not valid: " + start);
    log("Must be one of: " + START_ARGS);
    return finish();
  }

  // Set start date
  let startDate = new Date();
  if ( start === 'sun' ) {
    startDate.setDate(startDate.getDate() - startDate.getDay());
  }
  else if ( start === 'mon' ) {
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
  }
  startDate.setHours(0, 0, 0, 0);


  // Get the User's Tasks
  _getTasks(filter, function(tasks) {

    // Display the Planner
    _display(tasks, startDate, fixedWidth);

    // Display the Overdue and No Due Tasks
    _displayExtra(tasks, startDate, fixedWidth);

    // Finish
    finish();

  });

}


/**
 * Get the User's Tasks
 * @param filter Filter String
 * @param callback Callback function(tasks)
 * @private
 */
function _getTasks(filter, callback) {

  // Get parsed filter
  filter = parseFilter(filter);

  // Start Spinner
  log.spinner.start("Getting Tasks...");

  // Get User
  config.user(function(user) {

    // Get User's Tasks
    user.tasks.get(filter, function(err, tasks) {
      if ( err ) {
        log.spinner.error("Could not get tasks (" + err.msg + ")");
        return finish();
      }
      log.spinner.stop();
      return callback(tasks);
    });

  });

}


/**
 * Display the Tasks in a Weekly Planner starting on the specified
 * start date
 * @param tasks User's Tasks
 * @param start Start Date
 * @param fixedWidth Fixed planner width, if provided
 * @private
 */
function _display(tasks, start, fixedWidth) {

  // Header Titles
  let headers = [];

  // Width Information
  let colMinWidths = []; // Array of each column's min width
  let colMaxWidths = []; // Array of each column's max width

  // Table Data
  let data = [];


  // Get Display Styles
  let styles = config.get().styles;


  // Parse each Date
  for ( let i = 0; i < 7; i++ ) {

    // Set current Date
    let date = new Date(start);
    date.setDate(date.getDate() + i);


    // ==== DETERMINE HEADER ===== //

    // Min Width for this column based on header text
    let minWidth = 0;

    // Header for TODAY
    if ( _isToday(date) ) {
      let text = "TODAY";
      headers.push(
        _style(text, styles.due + ".underline")
      );
      minWidth = _reset(text).length+2;
    }

    // Header for other days
    else {
      let text = df(date, config.get().plannerDateformat);
      headers.push(
        _style(text, styles.due)
      );
      minWidth = _reset(text).length+2;
    }


    // ==== DETERMINE COLUMN DATA ==== //

    // Get Tasks DUE on Date
    let dt = [];
    for ( let j = 0; j < tasks.length; j++ ) {
      let task = tasks[j];
      if ( _sameDay(task.due, date) ) {
        dt.push(task);
      }
    }

    // Generate column data
    let lines = _displayTasks(dt);

    // Add data
    data.push(
      lines.join(
        _style('\n', 'reset')
      )
    );


    // ==== DETERMINE COLUMN MIN & MAX WIDTHS ==== //

    // Determine max line width
    let maxWidth = minWidth;
    for ( let i = 0; i < lines.length; i++ ) {
      let l = _reset(lines[i]).length + 2;
      if ( l > maxWidth ) {
        maxWidth = l;
      }
    }

    // Set Col Widths
    colMinWidths.push(minWidth);
    colMaxWidths.push(maxWidth);

  }


  // ==== BUILD TABLE ==== //

  let table = new Table({
    colWidths: _calcWidths(colMinWidths, colMaxWidths, fixedWidth),
    wordWrap: false,
    head: headers,
    style: {
      head: []
    }
  });
  table.push(data);

  // Print Table
  log(table.toString());

}


/**
 * Display an extra table displaying the tasks due before the start
 * of the planner and tasks with no due date
 * @param tasks User Tasks
 * @param start Planner Start Date
 * @param fixedWidth Fixed planner width, if provided
 * @private
 */
function _displayExtra(tasks, start, fixedWidth) {

  // Display Styles
  let styles = config.get().styles;

  // Get incomplete tasks that are due before the planner start and have no due date set
  let overdue = [];
  let nodue = [];
  for ( let i = 0; i < tasks.length; i++ ) {
    let task = tasks[i];
    if ( task.due === undefined && !task.isCompleted ) {
      nodue.push(task);
    }
    else if ( task.due < start && !task.isCompleted ) {
      overdue.push(task);
    }
  }

  // Set Headers of Extra Table
  let headers = [];
  if ( overdue.length > 0 ) {
    headers.push(
      _style("Overdue Tasks", styles.due)
    );
  }
  if ( nodue.length > 0 ) {
    headers.push(
      _style("No Due Date", styles.due)
    );
  }

  // Build Data
  let data = [];

  // Over Due Tasks
  if ( overdue.length > 0 ) {
    let overdueLines = _displayTasks(overdue);
    data.push(
      overdueLines.join(
        _style('\n', 'reset')
      )
    );
  }

  // No Due Tasks
  if ( nodue.length > 0 ) {
    let nodueLines = _displayTasks(nodue);
    data.push(
      nodueLines.join(
        _style('\n', 'reset')
      )
    );
  }

  // Set column widths
  let colWidths = [];
  if ( fixedWidth !== undefined ) {
    for ( let i = 0; i < headers.length; i++ ) {
      colWidths[i] = Math.floor((fixedWidth/headers.length)-(headers.length-1));
    }
  }

  // Build Extra Table
  let table = new Table({
    head: headers,
    style: { head: [] },
    colWidths: colWidths
  });
  table.push(data);

  // Print Extra Table
  log(table.toString());

}


/**
 * Generate the Column Data displaying the provided tasks
 * @param tasks Tasks to Display
 * @returns {Array} Array of lines to display
 * @private
 */
function _displayTasks(tasks) {

  // Display Styles
  let styles = config.get().styles;

  // Sort by list, priority
  tasks.sort(sort.tasks.ls);

  // Lines to return
  let lines = [];

  // Output Tasks
  let prevList = '';
  for ( let j = 0; j < tasks.length; j++ ) {
    let task = tasks[j];

    // List Name
    let list = task.list.name;
    if ( prevList !== list ) {
      lines.push(
        _style(list + ":", styles.list)
      );
      prevList = list;
    }

    // Task Line
    let line = '';

    // Completed Task
    if ( task.isCompleted ) {
      line += _style('x', styles.completed);
      line += _style(' ', 'reset');
      line += _style(task.name, styles.completed);
    }

    // Incomplete Task
    else {
      let style = styles.priority[task.priority];
      if ( task.priority > 0 ) {
        line += _style(task.priority, style);
        line += _style(' ', 'reset');
        line += _style(task.name, style);
      }
      else {
        line += _style('   ', 'reset');
        line += _style(task.name, style);
      }
    }

    // Reset Coloring
    line += _style('', 'reset');

    // Add Line
    lines.push(line);
  }

  // Reset Coloring
  lines.push(_style('', 'reset'));

  return lines;
}


/**
 * Calculate the optimum column widths given their desired min and max widths
 *  and the width of the console.
 * @param colMinWidths array of min widths
 * @param colMaxWidths array of max widths
 * @param fixedWidth fixed planner display width
 * @returns {Array} array of final widths
 * @private
 */
function _calcWidths(colMinWidths, colMaxWidths, fixedWidth) {

  // Total Width Available
  let width = DEFAULT_WIDTH;
  if ( fixedWidth !== undefined ) {
    width = fixedWidth;
  }
  else {
    try {
      width = ws.width;
    }
    catch (exception) {}
  }
  let widthTotal = width - 8;

  // Requested Total Width
  let widthRequested = 0;
  for ( let i = 0; i < colMaxWidths.length; i++ ) {
    widthRequested += colMaxWidths[i];
  }

  // Width to Reduce
  let widthReduce = widthRequested > widthTotal ? widthRequested - widthTotal : 0;

  // Columns with Overflow
  let overflow = 0;
  for ( let i = 0; i < colMinWidths.length; i++ ) {
    if ( colMaxWidths[i] > colMinWidths[i] ) {
      overflow++;
    }
  }

  // Final Column Widths
  let colWidths = [];

  // Calculate each columns width
  for ( let i = 0; i < colMinWidths.length; i++ ) {
    let min = colMinWidths[i];
    let max = colMaxWidths[i];

    if ( widthReduce === 0 ) {
      colWidths.push(max);
    }
    else if ( max > min ) {
      let w = max - Math.ceil(widthReduce/overflow);
      if ( w < min ) {
        w = min;
      }
      colWidths.push(w);
    }
    else {
      colWidths.push(min);
    }
  }

  return colWidths;

}




// ==== HELPER FUNCTIONS ==== //


/**
 * Check if the two Dates are the same day
 * @param d1 Date 1
 * @param d2 Date 2
 * @returns {boolean}
 * @private
 */
function _sameDay(d1, d2) {
  if ( d1 === undefined || d2 === undefined ) {
    return false;
  }
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * Check if the specified Date is today
 * @param date Date
 * @returns {boolean}
 * @private
 */
function _isToday(date) {
  return _sameDay(date, new Date());
}

/**
 * Style the Text using the specfied Chalk style
 * @param text Text to Style
 * @param style Chalk Style (ex: yellow.underline)
 * @returns {string} Styled String
 * @private
 */
function _style(text, style) {
  if ( config.get().plain ) {
    return text;
  }

  let parts = style.split('.');
  let c = chalk;
  for ( let i = 0; i < parts.length; i++ ) {
    c = c[parts[i]];
  }
  return c(text);
}

/**
 * Remove color and style info from the text string
 * @param text Text String
 * @returns {string}
 * @private
 */
function _reset(text) {
  return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}


module.exports = {
  command: 'planner [filter...]',
  options: [
    {
      option: "-s, --start <start>",
      description: "Planner start day (sun, mon, or today)"
    },
    {
      option: "-w, --width <cols>",
      description: "Set fixed planner display width (in number of columns)"
    }
  ],
  description: 'Display tasks in a weekly planner (--start: sun, mon, today)',
  action: action
};
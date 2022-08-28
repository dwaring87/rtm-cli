'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const prompt = require('../utils/prompt.js');
const finish = require('../utils/finish.js');
const taskIds = require('../../node_modules/rtm-api/src/utils/taskIds.js')


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

  /**
   * Parses the task series for tasks with Notes and returns those for the output
   * @private
   * @param {RTM task series} taskseries 
   * @param {any} params  An object including the taskseries_id, 
  *          task_id, list_id and a has Note filter
   */
  function _findNotes(taskseries,params) {
    let found = false;
    for (let i = 0; i < taskseries.length; i++) {
        const ts = taskseries[i];
        if (ts.id == params.taskseries_id && !found && ts.notes !== undefined) {
            NOTES.push({
              index: index,
              name: ts.name,
              notes: ts.notes.note
            });
            found = true;
        }
    }
  }

  // Display info
  log.spinner.start("Getting Task(s)...");

  // Get User
  config.user(function(user) {

    getTaskByIndex(user,index);

  });

  function getTaskByIndex(user,index) {
    // Parse arguments
    index = parseInt(index.trim());

    // Get Task
    let method='rtm.tasks.getList';

    let params ={
    "task_id":  taskIds.getTaskId(user.id,index), //818350699,
    "taskseries_id": taskIds.getTaskSeriesId(user.id,index), //451691559,
    "list_id": taskIds.getListId(user.id,index), //414716,
    "filter": "hasNotes:true"
    }

    user.get(method,params,function(err, resp) {
        if ( err ) {
            log.spinner.error("Could not get Task #" + index + " (" + err.msg + ")");
            return null;
        }

        else if (typeof resp.tasks.list !== 'undefined') {
            let taskseries = resp.tasks.list[0].taskseries;
            _findNotes(taskseries,params);
        }

        // Finish
        _processFinished(count, max);

    });
}


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
    // console.log(styles);

    // Print NOTES
    for ( let i = 0; i < NOTES.length; i++ ) {
      log.style(_pad(NOTES[i].index , NOTES.length), styles.index);
      log.style(' ');
      log.style(NOTES[i].name);
      for (const note of NOTES[i].notes) {
        log();
        log.style('Note: ',styles.due)
        log.style(' ' + note.title,true);
        log('========');
        log(note.$t);
        log();
      }

    }

    return finish();
  }

  function _finish(count, max) {
    if ( count === max-1 ) {
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



}


module.exports = {
  command: 'notes [indices...]',
  options: [],
  description: 'Display the associated Notes of a Task',
  action: action
};

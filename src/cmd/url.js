'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const prompt = require('../utils/prompt.js');
const finish = require('../utils/finish.js');
const taskIds = require('../../node_modules/rtm-api/src/utils/taskIds.js')
const opn = require('opn');


let URLS = [];
let OPEN = false;


/**
 * This command displays a task url
 * @param args index
 * @param env
 */
function action(args, env) {

  // Reset URLs
  URLS = [];

  // Set Open flag
  OPEN = env.open === undefined ? false : env.open;

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
   * Parses the task series for tasks with URL and returns those for the output
   * @private
   * @param {RTM task series} taskseries 
   * @param {any} params  An object including the taskseries_id, 
  *          task_id, list_id and a has URL filter
   */
  function _findUrls(taskseries,params) {
    let found = false;
    for (let i = 0; i < taskseries.length; i++) {
        const ts = taskseries[i];
        if (ts.id == params.taskseries_id && !found && ts.url !== undefined) {
            URLS.push({
              index: index,
              url: ts.url,
              name: ts.name
            });
            found = true;
        }
    }
  }

  // Display info
  log.spinner.start("Getting Task(s)...");

  // Get User
  config.user(function(user) {

    // Parse arguments
    index = parseInt(index.trim());

    // Get Task
    let method='rtm.tasks.getList';

    let params ={
      "task_id":  taskIds.getTaskId(user.id,index), //818350699,
      "taskseries_id": taskIds.getTaskSeriesId(user.id,index), //451691559,
      "list_id": taskIds.getListId(user.id,index), //414716,
      "filter": "hasURL:true"
    }

    user.get(method,params,function(err, resp) {
      if ( err ) {
        log.spinner.error("Could not get Task #" + index + " (" + err.msg + ")");
      }

      else if (typeof resp.tasks.list !== 'undefined') {
        let taskseries = resp.tasks.list[0].taskseries;
        _findUrls(taskseries,params);
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

    // Print URLs
    for ( let i = 0; i < URLS.length; i++ ) {
      console.log(URLS[i].index + " " + URLS[i].name + " " + URLS[i].url);
    }

    // Open URL
    if ( OPEN ) {
      for ( let i = 0; i < URLS.length; i++ ) {
        opn(URLS[i].url, {wait: false}).then(function() {
          _finish(i, URLS.length);
        });
      }
    }
    else {
      return finish();
    }
  }

  function _finish(count, max) {
    if ( count === max-1 ) {
      return finish();
    }
  }

}


module.exports = {
  command: 'url [indices...]',
  options: [
    {
      option: "-o, --open",
      description: "Open the URLs in a browser"
    }
  ],
  description: 'Display the associated URL of a Task',
  action: action
};

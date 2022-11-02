'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const finish = require('../utils/finish.js');
const filter = require('../utils/filter');
const { indexPrompt } = require('../utils/prompt')
const opn = require('opn');


let URLS = [];
let OPEN = false;


/**
 * This command displays a task url
 * @param args index
 * @param env
 */
async function action(args, env) {

  // Reset URLs
  URLS = [];

  // Set Open flag
  OPEN = env.open === undefined ? false : env.open;

  const user = config.user(user => user)

  let indices = []

  // Prompt for task
  if ( args.length < 1 ) {
    indices = indexPrompt('Task:')
    args[0] = indices
  }


  log.spinner.start("Getting Task(s)");
  // Use provided args
  for (const arg in args[0]) {
      if (Object.hasOwnProperty.call(args[0], arg)) {
          const index = args[0][arg];
          const filterString = filter('hasUrl:true');
          let task =  await user.tasks.rtmIndexFetchTask(index,filterString)
          if (task.err == undefined ) {
              task = task.task
          } else {
            log.spinner.warn('Task #' + index + ' does not have a URL or is not found');
          }

          // Push to URLS
          if ( task && task.url !== undefined ) {
            URLS.push({
            index: index,
            url: task.url,
            name: task.name
            });
          }         
      }
  }
  // Print URLs
  log.spinner.stop();
  for ( let i = 0; i < URLS.length; i++ ) {
      log(URLS[i].index + " " + URLS[i].name + " " + URLS[i].url);
      }

  // Open URL
  if ( OPEN ) {
    for ( let i = 0; i < URLS.length; i++ ) {
      opn(URLS[i].url, {wait: false})//.then(function() {});
    }
  }
  

  finish()
  

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
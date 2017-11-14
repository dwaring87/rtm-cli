'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const styles = config.get().styles;


/**
 * This command lists all of the User's current RTM Task Tags
 */
function action(args, env, callback) {
  config.user(function(user) {
    log.spinner.start("Getting Tags...");

    // Get Tasks
    user.tasks.get('isTagged:true', function(err, tasks) {
      if ( err ) {
        log.spinner.error("Could not get tags (" + err.msg + ")");
        return callback();
      }
      log.spinner.stop();

      // List of Tags
      let tags = [];

      // Get Tags from Tasks
      for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];
        let _tags = task.tags;

        // Parse Each Task's Tag
        for ( let j = 0; j < _tags.length; j++ ) {
          let _tag = _tags[j];

          // Check for matching Tag
          let found = false;
          for ( let k = 0; k < tags.length; k++ ) {
            if ( tags[k].name === _tag ) {
              if ( task.isCompleted ) {
                tags[k].completed = tags[k].completed + 1;
              }
              else {
                tags[k].incomplete = tags[k].incomplete + 1;
              }
              tags[k].count = tags[k].count + 1;
              found = true;
            }
          }

          // Add new Tag
          if ( !found ) {
            tags.push({
              name: _tag,
              completed: task.isCompleted ? 1 : 0,
              incomplete: task.isCompleted ? 0 : 1,
              count: 1
            });
          }
        }
      }

      // Print Tags
      for ( let i = 0; i < tags.length; i++ ) {
        let tag = tags[i];
        log.style(tag.name, styles.tags);
        log.style(' ');
        log.style(tag.incomplete);
        log.style('/');
        log.style(tag.completed, 'dim');
        log();
      }

      // Return
      return callback();

    });
  });
}


module.exports = {
  command: 'tags',
  alias: 't',
  description: 'Display all tags',
  action: action
};
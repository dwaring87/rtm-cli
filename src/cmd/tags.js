'use strict';

const log = require('../utils/log.js');
const config = require('../utils/config.js');
const filter = require('../utils/filter')
const finish = require('../utils/finish.js');
const styles = config.get().styles;

/**
 * This command lists all of the User's current RTM Task Tags
 */
function action(args, env) {
  config.user(function(user) {
    log.spinner.start("Getting Tags...");
    
    // Get Tasks
    const filterString = filter('isTagged:true');
    // TODO use a new fetch function that doesn't create RTM Tasks for everything returned
    // TODO this should call the rtm.tags.getList, but then it wouldn't be able to show the task counts
    user.tasks.get(filterString, function(err, tasks) {
      if ( err ) {
        log.spinner.error("Could not get tags (" + err.msg + ")");
        return finish();
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

      // Get max tag length
      let max = 0;
      for ( let i = 0; i < tags.length; i++ ) {
        let l = tags[i].name.length;
        max = l > max ? l : max;
      }

      // Print Tags
      for ( let i = 0; i < tags.length; i++ ) {
        let tag = tags[i];
        log.style(tag.name, styles.tags);

        let delta = max - tag.name.length;
        for ( let i = 0; i < delta + 1; i++ ) {
          log.style(' ');
        }

        log.style(tag.incomplete);
        log.style('/');
        log.style(tag.completed, 'dim', true);
      }

      // Return
      return finish();

    });
  });
}


module.exports = {
  command: 'tags',
  alias: 't',
  description: 'Display all tags',
  action: action
};
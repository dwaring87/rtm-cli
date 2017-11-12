'use strict';


module.exports = {


  // ==== LIST SORTING FUNCTIONS ==== //

  lists: {

    /**
     * Sort the RTM Lists by the rtm-api added index field
     * @param {RTMList} a RTM List a
     * @param {RTMList} b RTM List b
     * @returns {number}
     */
    index: function(a, b) {
      return a.index - b.index;
    },


    /**
     * Sort the RTM Lists by the RTM List id
     * @param {RTMList} a RTM List a
     * @param {RTMList} b RTM List b
     * @returns {number}
     */
    id: function(a, b) {
      return a.id - b.id;
    },


    /**
     * Sort the RTM Lists by the RTM List name
     * @param {RTMList} a RTM List a
     * @param {RTMList} b RTM List b
     * @returns {number}
     */
    name: function(a, b) {
      if ( a.name.toLowerCase() < b.name.toLowerCase() ) {
        return -1;
      }
      else if ( a.name.toLowerCase() > b.name.toLowerCase() ) {
        return 1;
      }
      else {
        return 0;
      }
    }

  },


  // ==== TASK SORTING FUNCTIONS ==== //

  tasks: {

    /**
     * Sort Tasks by Index
     * @param a
     * @param b
     * @returns {number}
     */
    index: function(a, b) {
      return a.index - b.index;
    },

    /**
     * Sort Tasks By Priority: 1,2,3,0
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    priority: function(a, b) {
      let ap = a.priority === 0 ? 4 : a.priority;
      let bp = b.priority === 0 ? 4 : b.priority;

      return ap - bp;
    },

    /**
     * Sort by Task Due Date
     * @param a
     * @param b
     */
    due: function(a, b) {
      if ( a.due && !b.due ) {
        return -1;
      }
      else if ( !a.due && b.due ) {
        return 1;
      }
      else if ( a.due < b.due ) {
        return -1;
      }
      else if ( a.due > b.due ) {
        return 1;
      }
      else {
        return 0;
      }
    },

    /**
     * Sort by task completed status: uncompleted, completed
     * @param a
     * @param b
     * @returns {number}
     */
    completed: function(a, b) {
      if ( a.isCompleted && !b.isCompleted ) {
        return 1;
      }
      else if ( !a.isCompleted && b.isCompleted ) {
        return -1;
      }
      else {
        return 0;
      }
    },

    /**
     * Sort Tasks By List Name (case insensitive)
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    listName: function(a, b) {
      if ( a._list && b._list ) {
        if ( a._list.name.toLowerCase() < b._list.name.toLowerCase() ) {
          return -1;
        }
        else if ( a._list.name.toLowerCase() > b._list.name.toLowerCase() ) {
          return 1;
        }
        else {
          return 0;
        }
      }
      return 0;
    },

    /**
     * Sort Tasks for `ls` display (list name, priority)
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    ls: function(a, b) {
      let sort = require(__filename);

      // Sort by list
      let list = sort.tasks.listName(a, b);
      if ( list === 0 ) {

        // Sort by completed status
        let comp = sort.tasks.completed(a, b);
        if ( comp === 0 ) {

          // Sort by priority
          let pri = sort.tasks.priority(a, b);
          if ( pri === 0 ) {

            // Sort by Due date
            return sort.tasks.due(a, b);

          }
          else {
            return pri;
          }

        }
        else {
          return comp;
        }
      }
      else {
        return list;
      }
    }

  }

};
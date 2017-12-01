'use strict';

const config = require('../utils/config.js');


/**
 * Parse filter text to append preconfigured filter
 * @param filter
 */
function filter(filter) {
  if ( filter === undefined ) {
    filter = '';
  }

  // Filters
  let filters = [];

  // Generate Completed Filter
  let comp = config.get().completed;
  if ( comp === false ) {
    filters.push('(status:incomplete)');
  }
  else if ( comp !== true && comp > 0 ) {
    filters.push('(status:incomplete OR completedWithin:"' + comp + ' days")');
  }

  // Generate Due Filter
  let due = config.get().hideDue;
  if ( typeof due === 'number' && due > 0 ) {
    filters.push('(NOT dueAfter:"' + due + ' days")');
  }

  // Add user filter
  if ( filter.trim() !== '' ) {
    filters.push('(' + filter + ')');
  }

  // Join filters
  return filters.join(' AND ');

}

module.exports = filter;
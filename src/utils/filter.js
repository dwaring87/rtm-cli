'use strict';

const config = require('../utils/config.js');


/**
 * Parse filter text to append preconfigured filter
 * @param filter
 */
function filter(filter) {

  // Generate Completed Filter
  let compFilter = '';
  let comp = config.get().completed;
  if ( comp === false ) {
    compFilter = 'status:incomplete';
  }
  else if ( comp !== true && comp > 0 ) {
    compFilter = 'status:incomplete OR completedWithin:"' + comp + ' days"';
  }

  // Add user filter
  let rtn = '';
  if ( filter.trim() !== '' ) {
    rtn = '(' + compFilter + ') AND (' + filter + ')';
  }
  else {
    rtn = compFilter;
  }

  return rtn;
}

module.exports = filter;
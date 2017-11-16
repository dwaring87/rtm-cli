'use strict';

const config = require('../utils/config.js');


/**
 * Parse filter text to append preconfigured filter
 * @param filter
 */
function filter(filter) {
  let comp = config.get().completed;
  if ( comp === false ) {
    if ( filter !== '' ) {
      filter += " AND ";
    }
    filter += 'status:incomplete';
  }
  else if ( comp !== true && comp > 0 ) {
    if ( filter !== '' ) {
      filter += " AND ";
    }
    filter += '(status:incomplete OR completedWithin:"' + comp + ' days")';
  }
  return filter;
}

module.exports = filter;
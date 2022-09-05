'use strict';

const config = require('./config.js');
const log = require('./log.js');

/**
 * 
 * @param {string} type note|url
 * @param {object} task the task to print the indicator
 * @param {string} style emoji|text
 */
function printIndicator(type,task) {
    let styles = config.get().styles;
    let iconType = config.get().iconType;

    let indicatorStyle = task.isCompleted ? styles.completed : styles[type];
    let notesIndicator,urlIndicator;
    iconType = iconType || 'text'; // defaults to text if nothing included
    switch (iconType) {
        case 'emoji':
            notesIndicator = '📓';
            urlIndicator = '🔗'
        break;
        case 'text':  
        default:
            notesIndicator = '*';
            urlIndicator = '+'
        break;
    }
    let indicators = {
        notes: notesIndicator,
        url: urlIndicator
    }
    log.style(indicators[type], indicatorStyle);
}

module.exports = printIndicator;
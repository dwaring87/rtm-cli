'use strict';

const config = require('./config.js');
const log = require('./log.js');

/**
 * 
 * @param {string} type note|url
 * @param {object} task the task to print the indicator
 * @param {string} style emoji|text
 */
function printIndicator(type,task,style) {
    let styles = config.get().styles;

    let indicatorStyle = task.isCompleted ? styles.completed : styles[type];
    let noteIndicator,urlIndicator;
    switch (style) {
        case 'emoji':
            noteIndicator = '📓';
            urlIndicator = '🔗'
        break;
        case 'text':  
        default:
            noteIndicator = '*';
            urlIndicator = '+'
        break;
    }
    let indicators = {
        note: noteIndicator,
        url: urlIndicator
    }
    log.style(indicators[type], indicatorStyle);
}

module.exports = printIndicator;
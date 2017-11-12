'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');
const api = require('rtm-api');
let CONFIG = require('../../config.json');


// Default Config File Locations
const DEFAULT_CONFIG_LOCATIONS = [
  path.normalize(os.homedir() + '/.rtm.json'),
  path.normalize(os.homedir() + '/rtm.json'),
  path.normalize(process.cwd() + '/rtm.json')
];

// List of Additional Config File Locations
let ADDITIONAL_CONFIG_LOCATIONS = [];



// Load the Default Config Locations
_loadDefaultConfigs();



/**
 * Parse any additional run-time config options and return the CONFIG
 * This will set _client to the RTMClient and _user to the RTMUser
 * @returns {object} Config object
 */
function get() {
  // Set the RTM Client
  CONFIG._client = new api(CONFIG.client.key, CONFIG.client.secret, CONFIG.client.perms);

  // Set the RTM User, if present
  if ( CONFIG.user ) {
    try {
      CONFIG._user = CONFIG._client.user.import(CONFIG.user);
    }
    catch(exception) {}
  }

  // Return the merged Config
  return CONFIG;
}

/**
 * Add a config file to the CONFIG
 * @param {string} files... File path(s) to config file(s)
 * @returns {Object} Config object
 */
function add(files) {
  if ( files ) {
    for ( let i = 0; i < arguments.length; i++ ) {
      ADDITIONAL_CONFIG_LOCATIONS.push(arguments[i]);
      _mergeConfig(arguments[i]);
    }
  }
  return get();
}

/**
 * Save the User to the config file
 * @param {RTMUser} user RTMUser to save
 * @param {string} [file] Config file path
 */
function saveUser(user, file=DEFAULT_CONFIG_LOCATIONS[0]) {
  let config = {};
  if ( fs.existsSync(file) ) {
    config = require(file);
  }
  config.user = CONFIG._client.user.export(user);
  fs.writeFileSync(file, JSON.stringify(config));
  _mergeConfig(file);
}


/**
 * Remove any saved User information from the default and additional
 * configuration files
 */
function removeUser() {
  let files = DEFAULT_CONFIG_LOCATIONS.concat(ADDITIONAL_CONFIG_LOCATIONS);
  for ( let i = 0; i < files.length; i++ ) {
    let file = files[i];
    if ( fs.existsSync(file) ) {
      let config = require(file);
      if ( config.user ) {
        delete config.user;
        fs.writeFileSync(file, JSON.stringify(config));
      }
    }
  }
  if ( CONFIG.user ) {
    delete CONFIG.user;
  }
  if ( CONFIG._user ) {
    delete CONFIG._user;
  }
}



/**
 * Load each of the Default Config Files
 * @private
 */
function _loadDefaultConfigs() {
  for ( let i = 0; i < DEFAULT_CONFIG_LOCATIONS.length; i++ ) {
    _mergeConfig(DEFAULT_CONFIG_LOCATIONS[i]);
  }
}


/**
 * Merge the specified config file into the already set CONFIG
 * @param {string} file Config File Path
 * @private
 */
function _mergeConfig(file) {
  if ( file && fs.existsSync(file) ) {
    let config = require(file);
    delete CONFIG._client;
    delete CONFIG._user;
    CONFIG = merge(CONFIG, config, {
      arrayMerge: function (d, s) {
        return d.concat(s);
      }
    });
  }
}





module.exports = {
  get: get,
  add: add,
  saveUser: saveUser,
  removeUser: removeUser
};
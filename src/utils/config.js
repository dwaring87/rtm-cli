'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const api = require('rtm-api');
const merge = require('deepmerge');
const login = require('./login.js');


const BASE_CONFIG = path.normalize(__dirname + '/../../config.json');

const DEFAULT_CONFIG_LOCATIONS = [
  path.normalize(os.homedir() + '/.rtm.json'),
  path.normalize(os.homedir() + '/rtm.json'),
  path.normalize(process.cwd() + '/rtm.json')
];


/**
 * RTM CLI Configuration
 */
class Config {

  /**
   * Set up a new Configuration
   */
  constructor() {
    this._CONFIG = {};
    this._CONFIG_FILES = [];

    this.read(BASE_CONFIG);
    for ( let i = 0; i < DEFAULT_CONFIG_LOCATIONS.length; i++ ) {
      this.read(DEFAULT_CONFIG_LOCATIONS[i]);
    }
  }


  /**
   * Get the Configuration Object
   * @returns {object}
   */
  get() {
    return this.config;
  }

  /**
   * Get the Configuration Object
   * @returns {object}
   */
  get config() {
    if ( this._CONFIG === {} ) {
      throw "No Configuration Set";
    }
    return this._CONFIG;
  }

  /**
   * Get the RTMClient from the configuration
   * @returns {RTMClient}
   */
  get client() {
    if ( !this._CONFIG._client ) {
      throw "No Client configuration set";
    }
    return this._CONFIG._client;
  }

  /**
   * Get the RTMUser from the configuration
   *
   * If no RTMUser is saved, start the login process
   * @returns {RTMUser}
   */
  get user() {
    if ( !this._CONFIG._user ) {
      login();
      return undefined;
    }
    return this._CONFIG._user;
  }


  /**
   * Read a configuration file to merge with the existing configuration
   * @param {string} file Configuration file path
   */
  read(file) {
    if ( file && fs.existsSync(file) ) {

      // Add file to list of used config files
      if ( this._CONFIG_FILES.indexOf(file) === -1 ) {
        this._CONFIG_FILES.push(file);
      }

      // Read the config file
      let config = require(file);

      // Reset CONFIG client and user
      delete this._CONFIG._client;
      delete this._CONFIG._user;

      // Merge config into CONFIG
      this._CONFIG = merge(this._CONFIG, config, {
        arrayMerge: function (d, s) {
          return d.concat(s);
        }
      });

      // Parse the Config Object
      this._parseConfig();

    }
  }


  /**
   * Save the RTM User to the configuration file
   * @param {RTMUser} user RTM User to save
   * @param {string} [file] Configuration file to save to
   */
  saveUser(user, file=DEFAULT_CONFIG_LOCATIONS[0]) {
    let config = {};
    if ( fs.existsSync(file) ) {
      config = require(file);
    }
    config.user = this.client.user.export(user);
    fs.writeFileSync(file, JSON.stringify(config));
    this.read(file);
  }


  /**
   * Remove any saved RTM User information from all configuration files
   */
  removeUser() {
    for ( let i = 0; i < this._CONFIG_FILES.length; i++ ) {
      let file = this._CONFIG_FILES[i];
      if ( fs.existsSync(file) ) {
        let config = require(file);
        if ( config.user ) {
          delete config.user;
          fs.writeFileSync(file, JSON.stringify(config));
        }
      }
    }
    if ( this._CONFIG.user ) {
      delete this._CONFIG.user;
    }
    if ( this._CONFIG._user ) {
      delete this._CONFIG._user;
    }
  }


  /**
   * Parse the Configuration properties
   * @private
   */
  _parseConfig() {
    // Set the RTM Client
    if ( this._CONFIG.client ) {
      this._CONFIG._client = new api(
        this._CONFIG.client.key,
        this._CONFIG.client.secret,
        this._CONFIG.client.perms
      );
    }

    // Set the RTM User, if present
    if ( this._CONFIG.user ) {
      try {
        this._CONFIG._user = this._CONFIG._client.user.import(this._CONFIG.user);
      }
      catch(exception) {}
    }
  }


}


module.exports = new Config();
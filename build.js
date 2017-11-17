#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const pkg = require('pkg');
const archiver = require('archiver');
const config = require('./package.json');

// Build Paths
const configPath = path.dirname(require.resolve('./package.json'));
const binPath = path.normalize(configPath + '/' + config.pkg.out);



clean();
build()
  .then(pack);



/**
 * Clean the Bin Directory
 */
function clean() {
  console.log();
  console.log("CLEANING...");
  let files = fs.readdirSync(binPath);
  for ( let file of files ) {
    fs.unlinkSync(path.normalize(binPath + '/' + file));
  }
}

/**
 * Build Binaries using PKG
 * @returns Promise
 */
function build() {
  console.log();
  console.log("BUILDING...");
  return pkg.exec(['./package.json', '--targets', config.pkg.targets, '--out-dir', binPath]);
}

/**
 * Pack the Binaries into separate zip files
 */
function pack() {
  console.log();
  console.log("PACKAGING...");

  let bins = fs.readdirSync(binPath);
  for ( let bin of bins ) {
    if ( bin.includes('rtm-cli-') ) {
      let parts = bin.split('-');
      let os = parts[2];
      let arch = parts[3];
      let name = 'rtm';
      let version = config.version;
      let zipName = name + '-' + os + '.' + arch + '-' + version + '.zip';

      let zipFile = path.normalize(binPath + '/' + zipName);
      let binFile = path.normalize(binPath + '/' + bin);

      let zip = fs.createWriteStream(zipFile);
      let archive = archiver('zip', {zib: {level: 9}});

      zip.on('close', function() {
        fs.unlinkSync(binFile);
        console.log("..." + bin);
      });

      zip.on('error', function(err) {
        throw err;
      });

      console.log(os);
      if ( os === 'win' ) {
        name = name + '.exe';
      }
      console.log(name);

      archive.pipe(zip);
      archive.file(binFile, {name: name});
      archive.finalize();
    }
  }
}


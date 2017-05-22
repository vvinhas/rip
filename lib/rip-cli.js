#!/usr/bin/env node
'use strict';

var fs = require('fs');
var commander = require('commander');
var defaultConfig = require('./config.js');
var ripServer = require('./rip-server');
// Getting args
commander.version('0.0.1').option('-p, --port <port>', 'The port in which the server will run. Default to 3001.').parse(process.argv);
// Find and read .riprc file
var ripFile = './.riprc';
var config = defaultConfig;

try {
  var stat = fs.statSync(ripFile);
  if (stat.isFile()) {
    var userConfig = fs.readFileSync(ripFile, 'utf8');
    config = Object.assign({}, defaultConfig, JSON.parse(userConfig));
  }
  // console.log('Updating config', config)
} catch (error) {
  console.error(error);
}

try {
  ripServer.run(config, commander);
} catch (error) {
  console.error(error);
}
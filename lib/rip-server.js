#!/usr/bin/env node
'use strict';

// Core
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var cors = require('cors');
var bodyParser = require('body-parser');
var store = require('store');

var run = function run(config, args) {
  // Setting some middlewares
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // Config Graves
  config.graves.forEach(function (graveAlias) {
    // Setup Grave store
    var graveStore = require('store');
    // Require the module
    var graveName = 'rip-grave-' + graveAlias;
    var gravePath = path.resolve('./node_modules/' + graveName);
    var grave = require(gravePath);
    // Calls Grave factory
    grave.factory(graveStore, 10);
    // Apply the router to the app
    app.use('/' + graveAlias, grave.make(graveStore));
    // Set the main store
    store.set(grave, graveStore);
    console.log('- Adding "' + graveAlias + '" grave.');
  });
  // Port Settings
  var port = args.port ? args.port : 3001;
  // Listening
  server.listen(port);
  console.log('\uD83D\uDC80  Running RIP on port ' + port);
};

module.exports = { run: run };
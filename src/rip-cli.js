#!/usr/bin/env node
const fs = require('fs')
const commander = require('commander')
const defaultConfig = require('./config.js')
const ripServer = require('./rip-server')
// Getting args
commander
  .version('0.0.1')
  .option('-p, --port <port>', 'The port in which the server will run. Default to 3001.')
  .parse(process.argv)
// Find and read .riprc file
const ripFile = './.riprc'
let config = defaultConfig

try {
  const stat = fs.statSync(ripFile)
  if (stat.isFile()) {
    const userConfig = fs.readFileSync(ripFile, 'utf8')
    config = Object.assign({}, defaultConfig, JSON.parse(userConfig))
  }
} catch (error) {
  console.error(error)
}

try {
  ripServer.run(config, commander)
} catch (error) {
  console.error(error)
}

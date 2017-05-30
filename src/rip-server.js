#!/usr/bin/env node
// Core
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const cors = require('cors')
const bodyParser = require('body-parser')
const parseGrave = require('./parseGrave')
const store = require('./store')
const { fromJS } = require('immutable')

const run = (config, args) => {
  const log = []
  // Setting some middlewares
  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  // Welcome Screen
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'))
  })
  // Config Graves
  config.graves.forEach(graveObj => {
    // Require the module
    const grave = parseGrave(graveObj)
    // Setup Grave store
    const graveStore = store.createGrave(grave.alias, fromJS(grave.api.init(grave.fake)))
    // Check for Grave relations
    if (grave.relationships) {
      graveStore.setRelationships(grave.relationships)
    }
    // Apply the router to the app
    const router = express.Router()
    app.use(`/${grave.alias}`, grave.api.make(
      router,
      graveStore.accessCreator()
    ))
    // Set the main store
    log.push(`⚰  Adding "${grave.alias}" grave`)
  })
  // Port Settings
  const port = args.port ? args.port : 3001
  // Listening
  server.listen(port)
  log.unshift(`💀  Running RIP on http://localhost:${port}`)
  log.forEach(entry => console.log(entry))
}

module.exports = { run }

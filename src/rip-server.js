#!/usr/bin/env node
// Core
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const cors = require('cors')
const bodyParser = require('body-parser')
// const pug = require('pug')
const graveParser = require('./graveParser')
const store = require('./store')
const { fromJS } = require('immutable')

const run = (config, args) => {
  const log = []
  let gravesAvailable = []

  // Setting some middlewares
  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static(path.join(__dirname, './welcome-page/public')))
  // Template Engine
  app.set('views', path.join(__dirname, './welcome-page/views'))
  app.set('view engine', 'pug')
  // Config Graves
  config.graves.forEach(graveObj => {
    // Parse the information captured for each grave
    const grave = graveParser(graveObj)
    gravesAvailable.push({ ...grave })
    // Setup the Grave Store
    const graveStore = store.createGrave(grave.alias, fromJS(grave.api.init(grave)))
    // Check for Grave relations
    if (grave.relationships) {
      graveStore.setRelationships(grave.relationships)
    }
    // Apply the router to the app
    const router = express.Router()
    const graveRouter = grave.api.make(
      router,
      graveStore.accessCreator(),
      grave
    )
    // Attach Grave router to RIP
    app.use(`/${grave.alias}`, graveRouter)
    // Log
    log.push(`⚰  Adding "${grave.alias}" grave`)
  })
  // Welcome Page
  app.get('/', (req, res) => {
    res.render('index', { graves: gravesAvailable })
  })
  // Port Settings
  const port = args.port ? args.port : 3001
  // Listening
  server.listen(port)
  log.unshift(`💀  Running RIP on http://localhost:${port}`)
  log.forEach(entry => console.log(entry))
}

module.exports = { run }

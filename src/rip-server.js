#!/usr/bin/env node
// Core
require('babel-polyfill')
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const cors = require('cors')
const bodyParser = require('body-parser')
const configParser = require('./parsers')
const storeCreator = require('./store')

const run = (config, args) => {
  config = configParser(config)
  const { persist, graves } = config
  const store = storeCreator(persist)
  const log = []
  // Setting some middlewares
  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static(path.join(__dirname, './welcome-page/public')))
  // Template Engine
  app.set('views', path.join(__dirname, './welcome-page/views'))
  app.set('view engine', 'pug')
  // Config Graves
  graves.map(grave => {
    const { alias, api, relationships } = grave
    // Setup the Grave Store
    const graveStore = store.createGrave(grave)
    // Check for Grave relations
    if (relationships) {
      graveStore.setRelationships(relationships)
    }
    // Apply the router to the app
    const router = express.Router()
    const graveRouter = api.make(
      router,
      graveStore.accessCreator(),
      grave
    )
    // Attach Grave router to RIP
    app.use(`/${alias}`, graveRouter)
    // Log
    log.push(`⚰  Adding "${alias}" grave`)
  })
  // Welcome Page
  app.get('/', (req, res) => {
    res.render('index', { graves })
  })
  // Port Settings
  const port = args.port ? args.port : 3001
  // Listening
  server.listen(port)
  log.unshift(`💀  Running RIP on http://localhost:${port}`)
  log.forEach(entry => console.log(entry))
}

module.exports = { run }

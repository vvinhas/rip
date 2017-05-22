#!/usr/bin/env node
// Core
// const path = require('path')
const _ = require('lodash')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const cors = require('cors')
const bodyParser = require('body-parser')
const parseGrave = require('./parseGrave')
const store = {}

const run = (config, args) => {
  const log = []
  // Setting some middlewares
  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  // Config Graves
  config.graves.forEach(graveObj => {
    // Require the module
    const grave = parseGrave(graveObj)
    // Setup Grave store
    _.set(store, grave.alias, grave.api.init())
    // const graveStore = _.get(store, grave.name)
    // Apply the router to the app
    const router = express.Router()
    router.use((req, res, next) => {
      let output, type
      const override = {
        json: res.json.bind(res),
        jsonp: res.jsonp.bind(res)
      }

      res.json = body => {
        output = body
        type = 'json'
      }

      res.jsonp = body => {
        output = body
        type = 'jsonp'
      }

      next()

      if (type) {
        console.log('Data:', output)
        return override[type](output)
      }
    })
    app.use(`/${grave.alias}`, grave.api.make(router, _.get(store, grave.alias)))
    // Set the main store
    log.push(`⚰  Adding "${grave.alias}" grave`)
  })
  // Port Settings
  const port = args.port ? args.port : 3001
  // Listening
  server.listen(port)
  log.unshift(`💀  Running RIP on port ${port}`)
  log.forEach(entry => console.log(entry))
}

module.exports = { run }

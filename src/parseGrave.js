const path = require('path')
const _ = require('lodash')
/**
 * Parse Grave information
 * @param {object} grave
 */
const parseGrave = grave => {
  let name, alias, api

  if (_.isString(grave)) {
    alias = grave
    name = `rip-grave-${alias}`
    api = require(path.resolve(`./node_modules/${name}`))
    return { name, alias, api }
  }

  if (_.isObjectLike(grave) &&
    _.has(grave, 'name')) {
    alias = grave.name
    name = `rip-grave-${alias}`
    api = require(path.resolve(`./node_modules/${name}`))
    return { ...grave, name, alias, api }
  }

  throw new Error('Invalid grave setup')
}

module.exports = parseGrave

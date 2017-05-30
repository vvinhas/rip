const path = require('path')
const _ = require('lodash')
/**
 * Parse Grave information
 * @param {object} grave
 */
const parseGrave = grave => {
  let name, alias, api, fake

  if (_.isString(grave)) {
    alias = grave
    name = `rip-grave-${alias}`
    api = require(path.resolve(`./node_modules/${name}`))
    fake = 0
    return { name, alias, api, fake }
  }

  if (_.isObjectLike(grave) &&
    _.has(grave, 'name')) {
    // Create some useful props
    alias = grave.name
    fake = (typeof grave.fake === 'number' && grave.fake % 1 === 0) ? grave.fake : 0
    if (_.has(grave, 'mapsTo')) {
      name = `custom-grave-${alias}`
      api = require(path.resolve(grave.mapsTo))
    } else {
      name = `rip-grave-${alias}`
      api = require(path.resolve(`./node_modules/${name}`))
    }

    return { ...grave, name, alias, api, fake }
  }

  throw new Error('Invalid grave setup')
}

module.exports = parseGrave

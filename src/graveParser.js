const path = require('path')
const _ = require('lodash')
/**
 * Parse Grave information
 * @param {object} grave
 */
const graveParser = data => {
  let name, alias, api, fake, crud, type

  if (_.isString(data)) {
    alias = data
    name = `rip-grave-${alias}`
    api = require(path.resolve(`./node_modules/${name}`))
    fake = 0
    return { name, alias, api, fake }
  }

  if (_.isObjectLike(data) &&
    _.has(data, 'grave')) {
    // Create some useful props
    alias = data.grave
    crud = data.crud === true ? true : false
    fake = (typeof data.fake === 'number' && data.fake % 1 === 0) ? data.fake : 0
    type = crud ? 'crud' : (_.has(data, 'mapsTo') ? 'custom' : 'package')

    switch (type) {
      case 'crud':
        name = `crud-grave-${alias}`
        api = require('./crudGrave')
        break;
      case 'custom':
        name = `custom-grave-${alias}`
        api = require(path.resolve(data.mapsTo))
        break;
      case 'package':
        name = `rip-grave-${alias}`
        api = require(path.resolve(`./node_modules/${name}`))
        break;  
    }

    return { ...data, name, alias, api, fake }
  }

  throw new Error('Invalid Grave Setup')
}

module.exports = graveParser

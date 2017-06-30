const path = require('path')
const _ = require('lodash')
/**
 * Parse Grave information
 * @param {object} grave
 */
const graveParser = data => {
  // Default settings
  if (_.isString(data)) {
    return {
      api: require('./crudGrave'),
      alias: data,
      fake: 0,
      shape: {}
    }
  }

  if (_.isObjectLike(data) &&
    _.has(data, 'grave')) {
    // Standarizing props
    return {
      ...data,
      alias: data.grave,
      api: typeof data.source === 'string' ?
        data.source.startsWith('./') ?
          require(path.resolve(data.source)) :
          require(path.resolve(`./node_modules/${data.source}`)) :
          require('./crudGrave'),
      fake: (typeof data.fake === 'number' && data.fake % 1 === 0) ? data.fake : 0,
      shape: typeof data.shape === 'object' ? data.shape : {}
    }
  }

  throw new Error('Invalid Grave Setup')
}

module.exports = graveParser

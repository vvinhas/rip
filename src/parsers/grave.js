const path = require('path')
const _ = require('lodash')
/**
 * Parse Grave information
 * @param {object} grave
 */
module.exports = data => {
  // Default settings
  if (_.isString(data)) {
    return {
      api: require('../graves/crud'),
      alias: data,
      fake: 0,
      shape: { _id: 'random.uuid' }
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
          require(path.resolve(`./node_modules/rip-grave-${data.source}`)) :
          require('../graves/crud'),
      fake: (typeof data.fake === 'number' && data.fake % 1 === 0) ? data.fake : 0,
      shape: typeof data.shape === 'object' ? { _id: 'random.uuid', ...data.shape } : { _id: 'random.uuid' }
    }
  }

  throw new Error('Invalid Grave Setup')
}

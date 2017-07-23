const path = require('path')

module.exports = persist => {
  // Memory is the default driver
  if (persist === 'memory') {
    return require('../drivers/memory')({})
  }
  // If it's a string, we try to require the rip-driver module
  if (typeof persist === 'string') {
    return require(path.resolve(`./node_modules/rip-driver-${persist}`))({})
  }
  // if it's an object, we pass the configuration
  if (typeof persist === 'object' && persist !== null) {
    if (typeof persist.driver === 'undefined') {
      throw new Error('You must specify a persistence driver.')
    }
    const options = persist.options ? persist.options : {}
    return require(path.resolve(`./node_modules/rip-driver-${persist.driver}`))(options)
  }
}

const path = require('path')

module.exports = config => {
  const { persist } = config
  const parsedConfig = { ...config }

  parsedConfig['name'] = path.basename(path.dirname(require.main.filename))
  parsedConfig['persist'] = persist
    ? require(path.resolve(`./node_modules/rip-driver-${persist}`))
    : null

  return parsedConfig
}

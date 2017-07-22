const path = require('path')

const memoryPersistDriver = config => grave => {
  let state = null

  const set = (data) => {
    state = data
  }
  const get = () => Promise.resolve(state)

  return {
    set,
    get
  }
}

module.exports = config => {
  const { persist } = config
  const parsedConfig = { ...config }

  parsedConfig['name'] = path.basename(path.dirname(require.main.filename))
  parsedConfig['persist'] = persist
    ? require(path.resolve(`./node_modules/rip-driver-${persist}`))
    : memoryPersistDriver

  return parsedConfig
}

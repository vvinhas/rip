const graveParser = require('../parsers/grave')
const persistParser = require('../parsers/persist')

module.exports = config => {
  const { persist, graves } = config

  return {
    persist: persistParser(persist),
    graves: graves.map(graveParser)
  }
}

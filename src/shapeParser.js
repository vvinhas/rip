const faker = require('faker')

const parseString = value => {
  const [type, method] = value.split('.')
  return faker[type][method]()
}

const parseArray = value => value.map(item => parseString(item))

const parseObject = value => {
  const shape = Object.assign({}, value)
  Object.keys(shape).forEach(key => {
    shape[key] = (function () {
      switch (shape[key].constructor) {
        case String:
          return parseString(shape[key])
        case Array:
          return parseArray(shape[key])
        case Object:
          return parseObject(shape[key])
        default:
          return null
      }
    })()
  })
  return shape
}

const shapeParser = shape => {
  if (typeof shape !== 'object' || shape === null) {
    return
  }
  return parseObject(shape)
}

module.exports = shapeParser

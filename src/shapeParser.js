const faker = require('faker')

const parseString = value => {
  const [type, method] = value.split('.')

  if (!faker[type][method]) {
    throw new Error('Invalid Faker method')
  }

  return faker[type][method]();
}

const parseArray = value => value.map(parseString)

const parseObject = value => {
  return Object.keys(value)
    .reduce((output, key) => {
      switch (value[key].constructor) {
        case String:
          output[key] = parseString(value[key])
          break
        case Object:
          output[key] = parseObject(value[key])
          break
        case Array:
          output[key] = parseArray(value[key])
          break
        default:
          output[key] = null
          break
      }

      return output
    }, {})
}

const shapeParser = shape => {
  if (!(shape instanceof Object) || shape === null) {
    return
  }
  return parseObject(shape)
}

module.exports = shapeParser

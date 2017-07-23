const faker = require('faker')

const parseArg = arg => isNaN(arg) ? arg : parseInt(arg)

const parseValue = value => {
  switch (value.constructor) {
    case String:
      return parseString(value)
    case Array:
      return parseArray(value)
    case Object:
      return parseObject(value)
    default:
      return value
  }
}

const parseString = value => {
  // Checks if the pattern corresponds to a Faker method
  if (!/^[a-z]+?\.[a-z]+?(,[a-z0-9]+)*?$/i.test(value)) {
    return value
  }

  const [ path, ...args ] = value.split(',')
  const [type, method] = path.split('.')

  if (!faker[type][method]) {
    return value
  }

  return faker[type][method](...args.map(parseArg))
}

const parseArray = value => value.map(parseValue)
const parseObject = value => Object.keys(value).reduce((output, key) => {
  output[key] = parseValue(value[key])
  return output
}, {})

const shapeParser = shape => {
  if (!(shape instanceof Object) || shape === null) {
    return
  }
  return parseObject(shape)
}

module.exports = shapeParser

const faker = require('faker')

const parseArg = arg => isNaN(arg) ? arg : parseInt(arg)

const parseString = value => {
  const [ path, ...args ] = value.split(',')
  const [type, method] = path.split('.')

  if (!faker[type][method]) {
    throw new Error('Invalid Faker method')
  }

  return faker[type][method](...args.map(parseArg))
}

const parseObject = value => {
  return Object.keys(value)
    .reduce((output, key) => {
      switch (value[key].constructor) {
        case String:
          output[key] = parseString(value[key])
          break
        case Array:
          output[key].push(parseObject(value[key]))
          break
        case Object:
          output[key] = parseObject(value[key])
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

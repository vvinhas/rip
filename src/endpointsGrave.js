const { fromJS } = require('immutable')
const shapeParser = require('./shapeParser')
const endpointsParser = require('./endpointsParser')

const init = () => fromJS({ data: [] })

const make = (router, store, options) => {
  const endpoints = endpointsParser(options.endpoints)
  endpoints.forEach(endpoint => {
    const { verb, path, shape } = endpoint
    router[verb](path, (req, res) => {
      const num = parseInt(req.params.num)
      const output = isNaN(num) ?
        shapeParser(shape) :
        Array.from({ length: num }, () => shapeParser(shape))

      res.json(output)
    })
  })

  return router
}

module.exports = {
  init,
  make
}
